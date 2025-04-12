import re
import argparse
import os
from docx import Document
from pdfminer.high_level import extract_text as extract_pdf_text
from collections import Counter
import nltk
from nltk.corpus import wordnet
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('wordnet')
    nltk.download('averaged_perceptron_tagger')
    nltk.download('punkt_tab')
    nltk.download('averaged_perceptron_tagger_eng')

def extract_text_from_file(file_path):
    """
    Extract text from PDF, DOCX, or TXT file.
    """
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_pdf_text(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    elif ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        raise ValueError("Unsupported file format. Only .pdf, .docx, and .txt are supported.")

def extract_text_from_docx(file_path):
    """
    Extract text from a DOCX file.
    """
    doc = Document(file_path)
    return '\n'.join([para.text for para in doc.paragraphs])

def get_wordnet_pos(word):
    """
    Map POS tag to first character lemmatize() accepts
    """
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {"J": wordnet.ADJ,
                "N": wordnet.NOUN,
                "V": wordnet.VERB,
                "R": wordnet.ADV}
    return tag_dict.get(tag, wordnet.NOUN)

def extract_keywords(text):
    """
    Extract and process keywords from text using NLP techniques.
    Returns a Counter object with keyword frequencies and their variations.
    """
    # Initialize lemmatizer
    lemmatizer = WordNetLemmatizer()
    
    # Tokenize and clean text
    words = word_tokenize(text.lower())
    words = [word for word in words if word.isalnum()]
    
    # Lemmatize words and get their variations
    processed_keywords = Counter()
    for word in words:
        # Get base form of word
        lemma = lemmatizer.lemmatize(word, get_wordnet_pos(word))
        processed_keywords[lemma] += 1
        
        # Get synonyms
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                processed_keywords[lemma.name().lower()] += 0.5  # Weight synonyms lower
    
    return processed_keywords

def compute_ats_score(resume_text, job_description_text):
    """
    Compute ATS score based on keyword matches with weighted scoring.
    """
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description_text)

    if not job_keywords:
        raise ValueError("Job description has no valid keywords.")

    # Calculate total possible score
    total_possible_score = sum(job_keywords.values())
    
    # Calculate actual score
    actual_score = 0
    matched_keywords = set()
    
    for keyword, weight in job_keywords.items():
        if keyword in resume_keywords:
            # Calculate match score based on frequency and weight
            match_score = min(resume_keywords[keyword], weight) * weight
            actual_score += match_score
            matched_keywords.add(keyword)
    
    # Calculate final score as percentage
    ats_score = (actual_score / total_possible_score) * 100 if total_possible_score > 0 else 0
    
    return ats_score, matched_keywords

def main():
    parser = argparse.ArgumentParser(description="ATS Resume Score (file resume + text job description)")
    parser.add_argument('--resume', required=True, help="Path to resume file (.pdf, .docx, or .txt)")
    args = parser.parse_args()

    try:
        resume_text = extract_text_from_file(args.resume)
    except Exception as e:
        print(f"\n❌ Error reading resume file: {e}")
        return

    print("\n📋 Paste the job description below (end with an empty line):")
    job_lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        job_lines.append(line)
    job_description_text = '\n'.join(job_lines)

    try:
        score, matched_keywords = compute_ats_score(resume_text, job_description_text)
        print(f"\n✅ ATS Score: {score:.2f}%")
        print("\n🔍 Matched Keywords:")
        for keyword in sorted(matched_keywords):
            print(f"- {keyword}")
    except Exception as e:
        print(f"\n❌ Error computing ATS score: {e}")

if __name__ == "__main__":
    main()
