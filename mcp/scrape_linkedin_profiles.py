#!/usr/bin/env python3
"""
scrape_linkedin_profiles.py

This script logs into LinkedIn using a saved session (or prompting for login if needed),
searches for profiles matching a given job title/company,
scrapes structured data (name, headline, education, experience, skills, etc.),
and saves the results to a JSON file.
"""

import sys
import time
import json
import asyncio

from linkedin_browser_mcp import (
    login_linkedin_secure,
    search_linkedin_profiles,
    view_linkedin_profile,

    DummyContext
)

# In your script:

async def scrape_profiles(query, limit):
    """
    Logs in to LinkedIn, searches for profiles matching `query`, and scrapes up to `limit` profiles.
    Returns the list of profile data dictionaries.
    """
    # Create a dummy context (or pass None and let view_linkedin_profile create one)
    ctx = DummyContext()  

    # STEP 1: Log into LinkedIn (this will open a browser for manual login the first time).
    print("[+] Initiating login procedure...")
    await login_linkedin_secure(ctx)
    print("[✓] Successfully logged in.")

    # STEP 2: Search for profiles matching the query.
    print(f"[+] Searching for profiles matching: '{query}'")
    profiles_result = await search_linkedin_profiles(query, ctx)
    
    # Extract profiles from the result dictionary
    if isinstance(profiles_result, dict):
        if "profiles" in profiles_result:
            profiles = profiles_result["profiles"]
        elif "results" in profiles_result:
            profiles = profiles_result["results"]
        else:
            profiles = []
            print("[-] No profiles found in search results")
    else:
        profiles = profiles_result
    
    if not profiles:
        print("[-] No profiles found for this query.")
        sys.exit(1)

    results = []
    profile_count = min(limit, len(profiles))
    print(f"[+] Found {len(profiles)} profiles; scraping the first {profile_count} profile(s)...")

    for i, profile in enumerate(profiles[:profile_count]):
        if isinstance(profile, dict):
            name = profile.get("name", "Unknown")
            url = profile.get("profileUrl", profile.get("profile_url", "N/A"))
        else:
            name = "Unknown"
            url = profile

        print(f"[{i+1}/{profile_count}] Scraping profile: {name} ({url})")
        try:
            # Pass the same dummy context to view_linkedin_profile
            data = await view_linkedin_profile(url, ctx)
            results.append(data)
            await asyncio.sleep(1.5)  # Delay between scrapes to be polite.
        except Exception as e:
            print(f"[!] Error scraping profile {url}: {e}")
            import traceback
            traceback.print_exc()
            continue

    return results

def save_results(results, filename="linkedin_profiles.json"):
    """
    Saves the list of scraped profile data to a JSON file.
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"[✓] Successfully saved {len(results)} profiles to '{filename}'.")
    except Exception as e:
        print(f"[!] Error saving results: {e}")

async def main():
    if len(sys.argv) != 3:
        print("Usage: python scrape_linkedin_profiles.py \"Job Title at Company\" <number_of_profiles>")
        sys.exit(1)

    query = sys.argv[1]
    try:
        limit = int(sys.argv[2])
    except ValueError:
        print("Please provide a valid integer for <number_of_profiles>")
        sys.exit(1)

    print(f"[+] Starting scraping for query: '{query}' with a limit of {limit} profile(s).")
    scraped_results = await scrape_profiles(query, limit)
    save_results(scraped_results)

if __name__ == "__main__":
    asyncio.run(main())
