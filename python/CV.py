import os
import json
import PyPDF2 as pdf
from dotenv import load_dotenv
import google.generativeai as genai
from docx import Document

# Load the environment variables
load_dotenv()

# Configure Google API
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
except Exception as e:
    print(f"Error configuring Google API: {str(e)}")
    print("Please make sure you have set up your GOOGLE_API_KEY in the .env file")
    exit(1)

def extract_text_from_pdf(pdf_path):
    try:
        reader = pdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"

def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        return f"Error extracting text from Word document: {str(e)}"

def extract_text_from_resume(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_text_from_docx(file_path)
    else:
        return f"Unsupported file format: {file_extension}"

def parse_resume_text(text):
    lines = text.split('\n')
    resume_data = {
        "personal_info": {},
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {}
    }
    
    current_section = None
    current_item = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.lower() == "education":
            current_section = "education"
            continue
        elif line.lower() == "experience":
            current_section = "experience"
            continue
        elif line.lower() == "projects":
            current_section = "projects"
            continue
        elif line.lower() == "technical skills":
            current_section = "skills"
            continue
            
        if current_section is None:
            if "|" in line:
                parts = line.split("|")
                resume_data["personal_info"]["name"] = parts[0].strip()
                contact_info = parts[1:]
                for info in contact_info:
                    info = info.strip()
                    if "@" in info:
                        resume_data["personal_info"]["email"] = info
                    elif "linkedin.com" in info:
                        resume_data["personal_info"]["linkedin"] = info
                    elif "github.com" in info:
                        resume_data["personal_info"]["github"] = info
                    elif "+" in info:
                        resume_data["personal_info"]["phone"] = info
            continue
            
        if current_section == "education":
            if "Bachelor" in line or "Master" in line:
                if current_item:
                    resume_data["education"].append(current_item)
                current_item = {"degree": line}
            elif "–" in line and current_item:
                current_item["duration"] = line
            elif current_item and "degree" in current_item and "duration" not in current_item:
                current_item["institution"] = line
                
        elif current_section == "experience":
            if "•" not in line and "–" in line:
                if current_item:
                    resume_data["experience"].append(current_item)
                parts = line.split("–")
                current_item = {
                    "title": parts[0].strip(),
                    "duration": parts[1].strip() if len(parts) > 1 else ""
                }
            elif "•" in line and current_item:
                if "description" not in current_item:
                    current_item["description"] = []
                current_item["description"].append(line.replace("•", "").strip())
                
        elif current_section == "projects":
            if "|" in line and "•" not in line:
                if current_item:
                    resume_data["projects"].append(current_item)
                parts = line.split("|")
                current_item = {
                    "name": parts[0].strip(),
                    "technologies": [tech.strip() for tech in parts[1:-1]],
                    "link": parts[-1].strip() if parts[-1].strip() else None
                }
            elif "•" in line and current_item:
                if "description" not in current_item:
                    current_item["description"] = []
                current_item["description"].append(line.replace("•", "").strip())
                
        elif current_section == "skills":
            if ":" in line:
                category, skills = line.split(":", 1)
                resume_data["skills"][category.strip()] = [skill.strip() for skill in skills.split(",")]
    
    if current_section == "education" and current_item:
        resume_data["education"].append(current_item)
    elif current_section == "experience" and current_item:
        resume_data["experience"].append(current_item)
    elif current_section == "projects" and current_item:
        resume_data["projects"].append(current_item)
        
    return resume_data

def analyze_resume(resume_text, job_description):
    try:
        input_prompt = f"""
        You are an expert resume analyzer and career advisor. Your task is to analyze resumes against job descriptions and provide specific, actionable feedback in a consistent JSON format.

        Instructions:
        1. Return ONLY a valid JSON object that strictly follows the schema below
        2. Do not include any additional text or explanations
        3. All fields must be filled with appropriate values
        4. Ensure all required fields are present
        5. Use proper JSON formatting

        Required JSON Schema:
        {{
          "resume_analysis": {{
            "quick_overview": {{
              "job_title_match": "string",
              "industry_fit": "string",
              "experience_level_match": "string"
            }},
            "score_breakdown": {{
              "overall_ATS_score": "string",
              "skills_match": "string",
              "experience_match": "string",
              "education_match": "string"
            }},
            "critical_gaps": {{
              "gap_1": {{
                "description": "string",
                "suggestions": "string"
              }},
              "gap_2": {{
                "description": "string",
                "suggestions": "string"
              }},
              "gap_3": {{
                "description": "string",
                "suggestions": "string"
              }}
            }},
            "keyword_analysis": {{
              "present_keywords": ["string"],
              "missing_keywords": ["string"],
              "suggested_keywords": ["string"]
            }},
            "improvement_plan": {{
              "immediate_changes": ["string"],
              "short_term_improvements": ["string"],
              "long_term_development": ["string"]
            }},
            "success_metrics": {{
              "current_application_success_rate": "string",
              "expected_success_after_improvements": "string",
              "time_to_implement_all_changes": "string"
            }},
            "customized_suggestions": ["string"]
          }}
        }}

        Resume: {resume_text}
        Job Description: {job_description}

        Analyze the above resume against the job description and return a JSON object following the schema exactly.
        """
        
        response = model.generate_content(input_prompt)
        # Parse the response to ensure it's valid JSON
        try:
            json.loads(response.text)
            return response.text
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON from it
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json_match.group(0)
            raise ValueError("Failed to extract valid JSON from response")
    except Exception as e:
        return f"Error analyzing resume: {str(e)}"

def main():
    try:
        # Get resume path and job description from user
        resume_path = input("Enter the path to your resume file: ")
        job_description = input("Enter the job description: ")
        
        if not os.path.exists(resume_path):
            print("Resume file not found. Please check the path and try again.")
            return
            
        # Extract and parse resume
        print("\nExtracting text from resume...")
        extracted_text = extract_text_from_resume(resume_path)
        if extracted_text.startswith("Error"):
            print(extracted_text)
            return
            
        print("Parsing resume data...")
        resume_data = parse_resume_text(extracted_text)
        
        # Save structured data
        with open("resume_data.json", "w") as f:
            json.dump(resume_data, f, indent=2)
        print("\nResume data has been saved to 'resume_data.json'")
        
        # Analyze resume against job description
        print("\nAnalyzing resume against job description...")
        analysis_result = analyze_resume(extracted_text, job_description)
        
        # Save analysis result
        with open("resume_analysis.txt", "w") as f:
            f.write(analysis_result)
        print("\nAnalysis result has been saved to 'resume_analysis.txt'")
        
        # Print analysis result
        print("\nAnalysis Result:")
        print("-" * 50)
        print(analysis_result)
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
