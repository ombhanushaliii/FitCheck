import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader, ArrowRight, Menu, CheckCircle, AlertCircle } from 'lucide-react';

function ProfileScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('1. Form submitted with URL:', url);

    // Reset states
    setLoading(true);
    setError(null);
    setProfileData(null);

    try {
      // Validate URL
      console.log('2. Validating URL...');
      if (!url.startsWith('https://www.linkedin.com/in/')) {
        console.error('URL validation failed');
        throw new Error('Please enter a valid LinkedIn profile URL (https://www.linkedin.com/in/...)');
      }

      // Send request to backend
      console.log('3. Sending request to backend...');
      const requestBody = JSON.stringify({ url });
      console.log('Request payload:', requestBody);

      const response = await fetch('http://localhost:5000/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('4. Response received:', response.status, response.statusText);

      const data = await response.json();
      console.log('5. Response data:', data);

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        throw new Error(data.error || 'Failed to scrape profile');
      }

      console.log('6. Setting profile data to state');
      setProfileData(data);
    } catch (err) {
      console.error('7. Error occurred:', err);
      setError(err.message);
    } finally {
      console.log('8. Request completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold">FitCheck</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <a href="#" className="text-gray-600 hover:text-gray-900">Features</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Templates</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="hidden md:block text-indigo-600 font-medium">Log in →</Link>
          <Menu className="md:hidden w-6 h-6" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            LinkedIn Profile Scraper
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Enter a LinkedIn profile URL to extract professional information and generate a resume.
          </p>
        </div>

        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="linkedin-url"
                  placeholder="https://www.linkedin.com/in/username"
                  className="flex-1 block w-full rounded-l-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`bg-indigo-600 text-white px-6 py-3 rounded-r-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2 w-4 h-4" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      Scrape
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Example: https://www.linkedin.com/in/johndoe
              </p>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {profileData && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.name || 'Name not available'}</h2>
                  <p className="text-gray-600">{profileData.headline || 'Headline not available'}</p>
                </div>
                <div className="bg-green-50 text-green-700 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Scraped Successfully
                </div>
              </div>

              {/* About Section */}
              {profileData.about && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{profileData.about}</p>
                </div>
              )}

              {/* Experience Section */}
              {profileData.experience && profileData.experience.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="space-y-4">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-medium text-gray-900">{exp.company_name}</div>
                        <div className="text-sm text-gray-500">{exp.duration}</div>

                        {exp.designations && exp.designations.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {exp.designations.map((role, idx) => (
                              <div key={idx} className="pl-3 border-l-2 border-gray-300">
                                <div className="font-medium text-gray-800">{role.designation}</div>
                                <div className="text-sm text-gray-500">{role.duration}</div>
                                <div className="text-sm text-gray-500">{role.location}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {profileData.education && profileData.education.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-medium text-gray-900">{edu.college}</div>
                        <div className="text-gray-700">{edu.degree}</div>
                        <div className="text-sm text-gray-500">{edu.duration}</div>
                        {edu.grade && <div className="text-sm text-gray-500">Grade: {edu.grade}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {profileData.skills && profileData.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-sm">
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileScraper;
