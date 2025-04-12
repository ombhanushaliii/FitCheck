# LinkedIn Profile Scraper
import os
import json
import re
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from time import sleep
from dotenv import load_dotenv

def scrape_linkedin_profile(profile_url):
    """
    Scrape LinkedIn profile data based on the provided URL

    Args:
        profile_url (str): LinkedIn profile URL to scrape

    Returns:
        dict: Profile data including name, headline, about, experience, education, and skills
    """
    # Load environment variables
    load_dotenv()

    # Check if credentials are available
    if 'EMAIL' not in os.environ or 'PASSWORD' not in os.environ:
        raise ValueError("LinkedIn credentials not found in environment variables")

    # Try to initialize a driver with available browsers
    driver = None
    browser_options = None

    # Common options for all browsers
    common_args = [
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-notifications"
    ]

    # Try Chrome first
    try:
        chrome_options = ChromeOptions()
        for arg in common_args:
            chrome_options.add_argument(arg)
        driver = webdriver.Chrome(options=chrome_options)
        print("Using Chrome WebDriver")
    except WebDriverException:
        # Try Edge next
        try:
            edge_options = EdgeOptions()
            for arg in common_args:
                edge_options.add_argument(arg)
            driver = webdriver.Edge(options=edge_options)
            print("Using Edge WebDriver")
        except WebDriverException:
            # Try Firefox as last resort
            try:
                firefox_options = FirefoxOptions()
                for arg in common_args:
                    firefox_options.add_argument(arg)
                driver = webdriver.Firefox(options=firefox_options)
                print("Using Firefox WebDriver")
            except WebDriverException:
                raise Exception("Could not initialize any WebDriver. Please make sure Chrome, Edge, or Firefox WebDriver is installed.")

    if not driver:
        raise Exception("Failed to initialize WebDriver")

    try:
        # Login to LinkedIn
        print(f"Navigating to LinkedIn login page...")
        driver.get('https://www.linkedin.com/login')

        # Wait for the page to load
        sleep(2)

        # Check if we're already logged in
        if "Feed" in driver.title:
            print("Already logged in to LinkedIn")
        else:
            print("Logging in to LinkedIn...")
            # Find username and password fields
            try:
                # Wait for the username field to be present
                wait = WebDriverWait(driver, 10)
                email_field = wait.until(EC.presence_of_element_located((By.ID, 'username')))
                email_field.clear()
                email_field.send_keys(os.environ['EMAIL'])

                # Find and fill password field
                password_field = driver.find_element(By.ID, 'password')
                password_field.clear()
                password_field.send_keys(os.environ['PASSWORD'])

                # Submit the form
                password_field.submit()

                # Wait for login to complete
                print("Waiting for login to complete...")
                wait.until(EC.url_contains('feed'))
                print("Login successful")
            except Exception as e:
                print(f"Login error: {e}")
                # Take a screenshot for debugging
                driver.save_screenshot('login_error.png')
                raise Exception(f"Failed to login: {e}")

        # Navigate to the profile URL
        print(f"Navigating to profile: {profile_url}")
        driver.get(profile_url)

        # Wait for the profile page to load
        sleep(3)

        # Initialize profile data dictionary
        profile_data = {}
        profile_data['url'] = profile_url

        # Get page title
        sleep(2)

        # Extract profile information
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'lxml')

        # Extract name - LinkedIn often changes class names, so we'll try multiple approaches
        try:
            print("Extracting profile name...")
            # Try different selectors for the name
            name_element = None

            # Method 1: Using h1 tag
            name_elements = soup.find_all('h1')
            for element in name_elements:
                if element.get_text().strip() and 'visually-hidden' not in element.get('class', []):
                    name_element = element
                    break

            # Method 2: Using specific class patterns that contain 'inline' and 'break-words'
            if not name_element:
                for h1 in soup.find_all('h1'):
                    classes = h1.get('class', [])
                    if isinstance(classes, list) and any('inline' in c for c in classes) and any('break-words' in c for c in classes):
                        name_element = h1
                        break

            # Method 3: Look for the first h1 in the main content area
            if not name_element:
                main_content = soup.find('main')
                if main_content:
                    name_element = main_content.find('h1')

            if name_element:
                name = name_element.get_text().strip()
                profile_data['name'] = name
                print(f"Found name: {name}")
            else:
                profile_data['name'] = 'Name not found'
                print("Could not find name element")

        except Exception as e:
            profile_data['name'] = 'Name not found'
            print(f"Error extracting name: {e}")

        # Extract headline - Try multiple approaches
        try:
            print("Extracting headline...")
            headline_element = None

            # Method 1: Look for div with specific class
            headline_candidates = soup.find_all('div', {'class': lambda c: c and 'break-words' in c})
            for element in headline_candidates:
                if element.get_text().strip() and not element.find('h1'):
                    headline_element = element
                    break

            # Method 2: Look for the element right after the name
            if not headline_element and name_element and name_element.parent:
                next_elements = name_element.parent.find_all(recursive=False)
                for i, elem in enumerate(next_elements):
                    if elem == name_element and i+1 < len(next_elements):
                        headline_element = next_elements[i+1]
                        break

            if headline_element:
                headline = headline_element.get_text().strip()
                profile_data['headline'] = headline
                print(f"Found headline: {headline}")
            else:
                profile_data['headline'] = 'Headline not found'
                print("Could not find headline element")

        except Exception as e:
            profile_data['headline'] = 'Headline not found'
            print(f"Error extracting headline: {e}")

        # Extract About section
        try:
            print("Extracting about section...")

            try:
                show_more_buttons = driver.find_elements(By.XPATH, "//button[contains(@class, 'inline-show-more-text__button') or contains(text(), 'Show more')]")
                if show_more_buttons:
                    for button in show_more_buttons:
                        if button.is_displayed():
                            print("Clicking 'Show more' button...")
                            driver.execute_script("arguments[0].click();", button)
                            sleep(1)
                            break
            except Exception as e:
                print(f"Could not click 'Show more' button: {e}")

            # Get updated page source
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'lxml')

            # Try multiple approaches to find the about section
            about_element = None

            # Method 1: Look for section with 'About' heading
            about_sections = soup.find_all('section')
            for section in about_sections:
                heading = section.find(['h2', 'h3'])
                if heading and 'about' in heading.get_text().lower():
                    about_element = section
                    # Get the content after the heading
                    for sibling in heading.next_siblings:
                        if sibling.name and sibling.get_text().strip():
                            about_element = sibling
                            break
                    break

            # Method 2: Look for div with specific classes
            if not about_element:
                about_candidates = soup.find_all('div', {'class': lambda c: c and ('pv3' in c or 'ph5' in c or 'display-flex' in c)})
                for element in about_candidates:
                    if element.get_text().strip() and len(element.get_text().strip()) > 50:  # About sections are usually longer
                        about_element = element
                        break

            # Method 3: Look for any div with substantial text after the headline
            if not about_element and 'headline' in profile_data:
                main_content = soup.find('main')
                if main_content:
                    for div in main_content.find_all('div'):
                        text = div.get_text().strip()
                        if len(text) > 100 and text != profile_data['headline']:  # Substantial text that's not the headline
                            about_element = div
                            break

            if about_element:
                about_text = about_element.get_text().strip()
                profile_data['about'] = about_text
                print(f"Found about section: {about_text[:50]}...")
            else:
                profile_data['about'] = 'About section not found'
                print("Could not find about section")

        except Exception as e:
            profile_data['about'] = 'About section not found'
            print(f"Error extracting about section: {e}")

        # Get sections for experience, education, etc.
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'lxml')
        sections = soup.find_all('section', {'class': 'artdeco-card pv-profile-card break-words mt2'})

        # Extract experience section
        try:
            # Find the experience section
            experience = None
            for sec in sections:
                if sec.find('div', {'id': 'experience'}):
                    experience = sec
                    break

            if experience:
                experience_items = experience.find_all('div', {'class': 'SAkrVBDOIoCCpFSAphUCaGSghqKHILGbog EGpbfwOeMHDFbYayVbnwKsTymikUDs xqdSBdUtBiEYznzTgSfUuCzMYgMdRJzBnbjfjgM'})

                def get_exp(exp):
                    exp_dict = {}
                    try:
                        name = exp.find('div', {'class': 'display-flex flex-wrap align-items-center full-height'})
                        name = name.find('span', {'class': 'visually-hidden'})
                        name = name.get_text().strip()
                        exp_dict['company_name'] = name
                    except Exception:
                        exp_dict['company_name'] = 'Company name not found'

                    try:
                        duration = exp.find('span', {'class': 't-14 t-normal'})
                        duration = duration.find('span', {'class': 'visually-hidden'})
                        duration = duration.get_text().strip()
                        exp_dict['duration'] = duration
                    except Exception:
                        exp_dict['duration'] = 'Duration not found'

                    try:
                        designations = exp.find_all('div', {'class': 'gFJNglFOnyZmIAbxVkrWpQCmMhGSasZRfRtGlFg'})
                        item_list = []

                        for position in designations:
                            spans = position.find_all('span', {'class': 'visually-hidden'})
                            item_dict = {}

                            if len(spans) > 0:
                                item_dict['designation'] = spans[0].get_text().strip()
                            if len(spans) > 1:
                                item_dict['duration'] = spans[1].get_text().strip()
                            if len(spans) > 2:
                                item_dict['location'] = spans[2].get_text().strip()
                            if len(spans) > 3:
                                item_dict['projects'] = spans[3].get_text().strip()

                            item_list.append(item_dict)

                        exp_dict['designations'] = item_list
                    except Exception:
                        exp_dict['designations'] = []

                    return exp_dict

                # Extract all experience items
                exp_list = []
                for exp in experience_items:
                    exp_list.append(get_exp(exp))

                profile_data['experience'] = exp_list
        except Exception as e:
            profile_data['experience'] = []
            print(f"Error extracting experience: {e}")

        # Extract education section
        try:
            # Find the education section
            education = None
            for sec in sections:
                if sec.find('div', {'id': 'education'}):
                    education = sec
                    break

            if education:
                education_items = education.find_all('div', {'class': 'SAkrVBDOIoCCpFSAphUCaGSghqKHILGbog EGpbfwOeMHDFbYayVbnwKsTymikUDs xqdSBdUtBiEYznzTgSfUuCzMYgMdRJzBnbjfjgM'})

                def get_edu(item):
                    item_dict = {}
                    spans = item.find_all('span', {'class': 'visually-hidden'})

                    if len(spans) > 0:
                        item_dict['college'] = spans[0].get_text().strip()
                    if len(spans) > 1:
                        item_dict['degree'] = spans[1].get_text().strip()
                    if len(spans) > 2:
                        item_dict['duration'] = spans[2].get_text().strip()
                    if len(spans) > 3:
                        item_dict['grade'] = spans[3].get_text().strip()

                    return item_dict

                # Extract all education items
                edu_list = []
                for item in education_items:
                    edu_list.append(get_edu(item))

                profile_data['education'] = edu_list
        except Exception as e:
            profile_data['education'] = []
            print(f"Error extracting education: {e}")

        # Extract skills section
        try:
            elements = soup.find_all('span', {'class': 'pvs-navigation__text'})

            skill_count = None
            for element in elements:
                text = element.get_text().strip()
                if "skills" in text.lower():
                    import re
                    match = re.search(r'(\d+)\s+skills', text.lower())
                    if match:
                        skill_count = match.group(1)
                        break

            if skill_count:
                # Click on the skills section to expand it
                try:
                    driver.find_element(By.ID, f"navigation-index-Show-all-{skill_count}-skills").click()
                    sleep(2)

                    # Get updated page source
                    page_source = driver.page_source
                    soup = BeautifulSoup(page_source, 'lxml')

                    # Find the skills section
                    skills_section = soup.find('section', {'class': 'artdeco-card pb3'})
                    if skills_section:
                        skill_items = skills_section.find_all('div', {'class': 'SAkrVBDOIoCCpFSAphUCaGSghqKHILGbog EGpbfwOeMHDFbYayVbnwKsTymikUDs xqdSBdUtBiEYznzTgSfUuCzMYgMdRJzBnbjfjgM'})

                        def get_skills(item):
                            item_dict = {}
                            spans = item.find_all('span', {'class': 'visually-hidden'})

                            if spans and len(spans) > 0:
                                item_dict['skill_name'] = spans[0].get_text().strip()
                            else:
                                item_dict['skill_name'] = 'Skill name not found'

                            return item_dict

                        # Extract all skill items
                        skill_list = []
                        for item in skill_items:
                            skill_list.append(get_skills(item))

                        profile_data['skills'] = skill_list
                except Exception as e:
                    profile_data['skills'] = []
                    print(f"Error clicking on skills section: {e}")
        except Exception as e:
            profile_data['skills'] = []
            print(f"Error extracting skills: {e}")

        # Return the profile data
        return profile_data
    except Exception as e:
        print(f"Error scraping LinkedIn profile: {e}")
        return {"error": str(e)}
    finally:
        # Always close the driver
        if driver:
            driver.quit()

