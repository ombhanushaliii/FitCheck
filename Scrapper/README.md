# LinkedIn Profile Scraper

A robust LinkedIn profile scraper that extracts professional information from LinkedIn profiles.

## Features

- Extracts profile information including:
  - Name
  - Headline
  - About section
  - Experience
  - Education
  - Skills
- Supports multiple browsers (Chrome, Edge, Firefox)
- Handles LinkedIn's dynamic UI changes
- Robust error handling

## Usage

### As a Module

```python
from scrapper import scrape_linkedin_profile

# Scrape a LinkedIn profile
profile_data = scrape_linkedin_profile("https://www.linkedin.com/in/username")

# Access the data
print(profile_data['name'])
print(profile_data['headline'])
print(profile_data['about'])
```

### With the Backend API

The scraper is integrated with a Flask backend API that provides an endpoint for scraping profiles:

```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://www.linkedin.com/in/username"
}
```

## Setup

1. Install the required dependencies:
   ```
   pip install selenium beautifulsoup4 lxml python-dotenv
   ```

2. Configure your LinkedIn credentials in a `.env` file:
   ```
   EMAIL=your_linkedin_email@example.com
   PASSWORD=your_linkedin_password
   ```

3. Make sure you have at least one of the following browsers and its corresponding WebDriver installed:
   - Chrome with ChromeDriver
   - Edge with EdgeDriver
   - Firefox with GeckoDriver

## How It Works

1. The scraper logs in to LinkedIn using the provided credentials
2. It navigates to the specified profile URL
3. It extracts information from the profile page using BeautifulSoup and Selenium
4. It returns the extracted data as a dictionary

## Notes

- LinkedIn may change its UI structure, which could affect the scraper
- Use responsibly and respect LinkedIn's terms of service
- LinkedIn may rate-limit or block your account if you make too many requests in a short time
