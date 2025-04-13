import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure the Gemini API
try:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not found in environment variables")
    else:
        genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Error configuring Gemini API: {e}")

def analyze_profiles(user_profile, reference_profile, job_role, target_company):
    """
    Analyze and compare two LinkedIn profiles for a specific job role using Gemini API

    Args:
        user_profile (dict): The user's LinkedIn profile data
        reference_profile (dict): The reference LinkedIn profile data (someone in the target role)
        job_role (str): The target job role
        target_company (str): The target company

    Returns:
        dict: Analysis results including comparison, recommendations, and action items
    """
    try:
        if not GEMINI_API_KEY:
            return {
                "error": "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file."
            }

        # Format the profiles for better prompt structure
        user_profile_str = json.dumps(user_profile, indent=2)
        reference_profile_str = json.dumps(reference_profile, indent=2)

        # Create the prompt for Gemini
        prompt = f"""
        You are a professional career advisor specializing in helping people transition to new roles.

        I need you to compare two LinkedIn profiles and provide a detailed analysis for the job role: {job_role}

        USER PROFILE:
        {user_profile_str}

        REFERENCE PROFILE (Someone already in the target role):
        {reference_profile_str}

        Please analyze these profiles and provide:

        1. SKILLS COMPARISON:
           - Skills the user has that are relevant to the job
           - Skills the user is missing compared to the reference profile
           - Skill gap analysis with percentages

        2. EXPERIENCE ANALYSIS:
           - How the user's experience aligns with the target role
           - Key experience gaps compared to the reference profile
           - Suggestions for gaining relevant experience

        3. EDUCATION COMPARISON:
           - Educational background comparison
           - Certifications or additional education that would be beneficial

        4. ACTIONABLE RECOMMENDATIONS:
           - Specific steps the user should take to become more competitive for the role
           - Prioritized list of skills to develop (top 3-5)
           - Projects or experiences to pursue

        5. STRENGTHS:
           - Areas where the user's profile is already strong for this role

        IMPORTANT: You must format your response as a valid JSON object with the following structure. Do not include any text outside of the JSON object:
        {{
            "skills_comparison": {{
                "matching_skills": ["skill1", "skill2"],
                "missing_skills": ["skill3", "skill4"],
                "skill_gap_percentage": 40
            }},
            "experience_analysis": {{
                "alignment": "Description of how well the experience aligns",
                "gaps": ["gap1", "gap2"],
                "suggestions": ["suggestion1", "suggestion2"]
            }},
            "education_comparison": {{
                "analysis": "Analysis of educational background",
                "recommendations": ["recommendation1", "recommendation2"]
            }},
            "actionable_recommendations": {{
                "steps": ["step1", "step2"],
                "priority_skills": ["skill1", "skill2"],
                "recommended_projects": ["project1", "project2"]
            }},
            "strengths": ["strength1", "strength2"]
        }}

        Ensure your analysis is specific to the {job_role} role, {target_company} comapny and provides practical, actionable advice. Remember to return ONLY valid JSON with no additional text or explanation.
        """

        # Call Gemini API
        model = genai.GenerativeModel('gemini-2.0-flash')  # Updated to use gemini-2.0-flash
        response = model.generate_content(prompt)

        # Parse the response
        try:
            # Extract JSON from the response
            response_text = response.text
            logger.info(f"Raw Gemini response: {response_text[:500]}...")  # Log first 500 chars of response

            # Find JSON content (in case there's additional text)
            json_start = response_text.find('{')
            if json_start == -1:
                logger.error("No JSON object found in response")
                return {
                    "error": "No JSON object found in response",
                    "raw_response": response_text
                }

            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]

            # Try to parse the JSON
            try:
                analysis_result = json.loads(json_str)
                logger.info("Successfully parsed JSON response")
                return analysis_result
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing JSON: {e}")

                # Try to create a structured response manually if JSON parsing fails
                return {
                    "skills_comparison": {
                        "matching_skills": ["Could not parse skills"],
                        "missing_skills": ["Please check raw response"],
                        "skill_gap_percentage": 50
                    },
                    "experience_analysis": {
                        "alignment": "Could not analyze experience alignment. Please check the raw response.",
                        "gaps": ["Error parsing response"],
                        "suggestions": ["Please try again later"]
                    },
                    "education_comparison": {
                        "analysis": "Could not analyze education. Please check the raw response.",
                        "recommendations": ["Error parsing response"]
                    },
                    "actionable_recommendations": {
                        "steps": ["Could not generate recommendations"],
                        "priority_skills": ["Error parsing response"],
                        "recommended_projects": ["Please try again later"]
                    },
                    "strengths": ["Could not identify strengths"],
                    "error": "Failed to parse analysis results",
                    "raw_response_excerpt": response_text[:1000]  # Include first 1000 chars of response
                }
        except Exception as e:
            logger.error(f"Unexpected error processing Gemini response: {e}")
            return {
                "error": f"Failed to process analysis results: {str(e)}",
                "raw_response_excerpt": response.text[:1000] if hasattr(response, 'text') else "No response text available"
            }

    except Exception as e:
        logger.error(f"Error in Gemini analysis: {e}")
        return {
            "error": f"Analysis failed: {str(e)}"
        }
