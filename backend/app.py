from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
import logging
import traceback
from datetime import datetime
from gemini_api import analyze_profiles

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

scrapper_path = os.path.join(os.path.dirname(__file__), '..', 'Scrapper')
sys.path.append(scrapper_path)
logger.info(f"Added Scrapper directory to path: {scrapper_path}")

# Import the scraper function
try:
    from scrapper import scrape_linkedin_profile
    logger.info("Successfully imported scrape_linkedin_profile function")
except ImportError as e:
    logger.error(f"Failed to import scrape_linkedin_profile: {e}")
    raise

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/api/scrape', methods=['POST'])
def scrape_profile():
    """
    API endpoint to scrape a LinkedIn profile

    Expects a JSON payload with a 'url' field containing the LinkedIn profile URL

    Returns:
        JSON response with the scraped profile data or an error message
    """
    start_time = datetime.now()
    logger.info(f"Received scrape request at {start_time}")

    try:
        # Get the URL from the request
        data = request.json
        logger.info(f"Request data: {data}")

        if not data or 'url' not in data:
            logger.warning("No URL provided in request")
            return jsonify({'error': 'No URL provided'}), 400

        url = data['url']
        logger.info(f"Processing URL: {url}")

        # Validate the URL
        if not url.startswith('https://www.linkedin.com/in/'):
            logger.warning(f"Invalid LinkedIn URL: {url}")
            return jsonify({'error': 'Invalid LinkedIn profile URL'}), 400

        # Check if .env file exists with credentials
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        if not os.path.exists(env_path):
            logger.warning(f".env file not found at {env_path}")
            return jsonify({'error': 'LinkedIn credentials not configured. Please create a .env file with EMAIL and PASSWORD.'}), 500

        # Scrape the profile
        logger.info(f"Starting scrape for profile: {url}")
        profile_data = scrape_linkedin_profile(url)
        logger.info(f"Scraping completed for {url}")

        # Create data directory if it doesn't exist
        data_dir = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(data_dir, exist_ok=True)

        # Save the profile data to a file
        profile_id = url.split("/")[-1]
        file_path = os.path.join(data_dir, f"{profile_id}.json")
        with open(file_path, 'w') as f:
            json.dump(profile_data, f, indent=4)
        logger.info(f"Saved profile data to {file_path}")

        # Calculate processing time
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        logger.info(f"Request completed in {processing_time} seconds")

        return jsonify(profile_data)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while scraping the profile. Please check the server logs for details.'
        }), 500

@app.route('/api/compare', methods=['POST'])
def compare_profiles():
    """
    API endpoint to compare two LinkedIn profiles for a specific job role

    Expects a JSON payload with:
    - user_url: The user's LinkedIn profile URL
    - reference_url: The reference LinkedIn profile URL (someone in the target role)
    - job_role: The target job role

    Returns:
        JSON response with the comparison analysis or an error message
    """
    start_time = datetime.now()
    logger.info(f"Received profile comparison request at {start_time}")

    try:
        # Get data from the request
        data = request.json
        logger.info(f"Request data: {data}")

        # Validate request data
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if 'user_url' not in data:
            return jsonify({'error': 'User profile URL not provided'}), 400

        if 'reference_url' not in data:
            return jsonify({'error': 'Reference profile URL not provided'}), 400

        if 'job_role' not in data:
            return jsonify({'error': 'Job role not provided'}), 400

        user_url = data['user_url']
        reference_url = data['reference_url']
        job_role = data['job_role']

        # Validate URLs
        if not user_url.startswith('https://www.linkedin.com/in/') or not reference_url.startswith('https://www.linkedin.com/in/'):
            return jsonify({'error': 'Invalid LinkedIn profile URL(s)'}), 400

        # Check if .env file exists with credentials
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        if not os.path.exists(env_path):
            return jsonify({'error': 'LinkedIn credentials not configured. Please create a .env file with EMAIL and PASSWORD.'}), 500

        # Scrape both profiles
        logger.info(f"Scraping user profile: {user_url}")
        user_profile = scrape_linkedin_profile(user_url)

        logger.info(f"Scraping reference profile: {reference_url}")
        reference_profile = scrape_linkedin_profile(reference_url)

        # Check if either profile scraping failed
        if 'error' in user_profile:
            return jsonify({'error': f"Failed to scrape user profile: {user_profile['error']}"}), 500

        if 'error' in reference_profile:
            return jsonify({'error': f"Failed to scrape reference profile: {reference_profile['error']}"}), 500

        # Analyze the profiles using Gemini
        logger.info(f"Analyzing profiles for job role: {job_role}")
        analysis_result = analyze_profiles(user_profile, reference_profile, job_role)

        # Create data directory if it doesn't exist
        data_dir = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(data_dir, exist_ok=True)

        # Save the analysis result to a file
        analysis_file = os.path.join(data_dir, f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(analysis_file, 'w') as f:
            json.dump({
                'user_profile': user_profile,
                'reference_profile': reference_profile,
                'job_role': job_role,
                'analysis': analysis_result
            }, f, indent=4)
        logger.info(f"Saved analysis to {analysis_file}")

        # Calculate processing time
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        logger.info(f"Comparison completed in {processing_time} seconds")

        # Return the analysis result along with profile summaries
        return jsonify({
            'user_profile': {
                'name': user_profile.get('name', 'Name not available'),
                'headline': user_profile.get('headline', 'Headline not available'),
                'url': user_url
            },
            'reference_profile': {
                'name': reference_profile.get('name', 'Name not available'),
                'headline': reference_profile.get('headline', 'Headline not available'),
                'url': reference_url
            },
            'job_role': job_role,
            'analysis': analysis_result
        })

    except Exception as e:
        logger.error(f"Error processing comparison request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while comparing profiles. Please check the server logs for details.'
        }), 500

if __name__ == '__main__':
    # Check if the .env file exists
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        logger.warning(".env file not found. Please create one with LinkedIn credentials (EMAIL and PASSWORD).")

    # Check if Gemini API key is configured
    if 'GEMINI_API_KEY' not in os.environ:
        logger.warning("GEMINI_API_KEY not found in environment variables. Profile comparison will not work.")

    logger.info("Starting Flask server")
    app.run(debug=True, port=5000)
