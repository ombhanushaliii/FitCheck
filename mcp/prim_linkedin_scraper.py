#!/usr/bin/env python3
"""
scrape_profiles.py

This script uses linkedin-scraper (v2.11.5) to:
  - Log into LinkedIn,
  - Scrape the profile data of a specified LinkedIn profile URL,
  - Save the scraped profile information as JSON.
  
Usage:
    python scrape_profiles.py "https://www.linkedin.com/in/some-profile-url/"
"""

import json
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Import from linkedin_scraper (version 2.11.5)
from linkedin_scraper import Person, actions

def main():
    if len(sys.argv) != 2:
        print("Usage: python scrape_profiles.py <LinkedIn Profile URL>")
        sys.exit(1)

    profile_url = sys.argv[1]

    # Set your LinkedIn credentials here.
    # For production code, consider reading these from environment variables or a secure config.
    EMAIL = "harish.pawali1967@gmail.com"
    PASSWORD = "bootwinxp"

    # Configure Selenium/Chrome options. You can set headless=True for silent operation.
    chrome_options = Options()
    chrome_options.headless = False  # Set to True to run headless.
    
    # Initialize the webdriver (make sure chromedriver is installed and in your PATH)
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Log into LinkedIn using the provided credentials.
        print("[*] Logging into LinkedIn...")
        actions.login(driver, EMAIL, PASSWORD)
        
        # Wait briefly to ensure login completes.
        time.sleep(5)
        
        # Create a Person object for the target profile.
        print(f"[*] Scraping profile: {profile_url}")
        person = Person(profile_url, driver=driver)
        person.scrape(close_on_complete=False)
        
        # Optionally, wait a few seconds to ensure all dynamic content is loaded
        time.sleep(3)
        
        # Retrieve the scraped profile data as a dictionary.
        data = person.__dict__
        
        # Save the data to a JSON file.
        output_filename = "linkedin_profile.json"
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"[*] Scrape complete. Data saved to '{output_filename}'.")
    except Exception as e:
        print(f"[!] An error occurred: {e}")
    finally:
        # Close the webdriver.
        driver.quit()

if __name__ == "__main__":
    main()
