import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader, ArrowRight, Menu, CheckCircle, AlertCircle, User, Briefcase, Award, BookOpen, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function LinkedinComp() {
    const { user, signOut } = useAuth();
  const [userUrl, setUserUrl] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [jobRole, setJobRole] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [referenceProfile, setReferenceProfile] = useState(null);
  const [target_company, setTarget_company] = useState('');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with data:', { userUrl, referenceUrl, jobRole });

    // Reset states
    setLoading(true);
    setError(null);
    setComparisonResult(null);
    setUserProfile(null);
    setReferenceProfile(null);
    setTarget_company(null);

    try {
      // Validate inputs
      if (!userUrl.startsWith('https://www.linkedin.com/in/')) {
        throw new Error('Please enter a valid LinkedIn profile URL for your profile');
      }

      if (!referenceUrl.startsWith('https://www.linkedin.com/in/')) {
        throw new Error('Please enter a valid LinkedIn profile URL for the reference profile');
      }

      if (!jobRole.trim()) {
        throw new Error('Please enter a job role');
      }

      // Send request to backend
      console.log('Sending comparison request to backend...');
      const requestBody = JSON.stringify({
        user_url: userUrl,
        reference_url: referenceUrl,
        job_role: jobRole,
        target_company: target_company
      });

      const response = await fetch('http://localhost:5000/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compare profiles');
      }

      // Set the profiles and comparison result
      setUserProfile(data.user_profile);
      setReferenceProfile(data.reference_profile);
      setComparisonResult(data.analysis);
    } catch (err) {
      console.error('Error occurred:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold">FitCheck</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              Log out
              <LogOut className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            LinkedIn Profile Comparison
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compare your LinkedIn profile with someone in your target role to get personalized career insights and recommendations.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div>
              <label htmlFor="user-linkedin-url" className="block text-sm font-medium text-gray-700 mb-1">
                Your LinkedIn Profile URL
              </label>
              <input
                type="text"
                id="user-linkedin-url"
                placeholder="https://www.linkedin.com/in/your-username"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border"
                value={userUrl}
                onChange={(e) => setUserUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="reference-linkedin-url" className="block text-sm font-medium text-gray-700 mb-1">
                Reference Profile URL (Someone in your target role)
              </label>
              <input
                type="text"
                id="reference-linkedin-url"
                placeholder="https://www.linkedin.com/in/reference-username"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="job-role" className="block text-sm font-medium text-gray-700 mb-1">
                Target Job Role
              </label>
              <input
                type="text"
                id="job-role"
                placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Target Company
              </label>
              <input
                type="text"
                id="target_company"
                placeholder="e.g., Google, Microsoft, Barclays, etc"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3 border"
                value={target_company}
                onChange={(e) => setTarget_company(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2 w-5 h-5" />
                    Analyzing Profiles...
                  </>
                ) : (
                  <>
                    Compare Profiles
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
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
        {comparisonResult && userProfile && referenceProfile && (
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Profile Comparison Analysis</h2>
                  <p className="text-gray-600">Target Role: <span className="font-semibold">{jobRole}</span></p>
                </div>
                <div className="bg-green-50 text-green-700 py-1 px-3 rounded-full text-sm font-medium flex items-center mt-2 md:mt-0">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Analysis Complete
                </div>
              </div>

              {/* Profiles Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Profile
                  </h3>
                  <p className="font-medium">{userProfile.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{userProfile.headline}</p>
                  <a href={userProfile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                    View on LinkedIn
                  </a>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Reference Profile
                  </h3>
                  <p className="font-medium">{referenceProfile.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{referenceProfile.headline}</p>
                  <a href={referenceProfile.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline">
                    View on LinkedIn
                  </a>
                </div>
              </div>

              {/* Skills Comparison */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-indigo-600" />
                  Skills Comparison
                </h3>

                {comparisonResult.skills_comparison && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Matching Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparisonResult.skills_comparison.matching_skills.map((skill, index) => (
                          <span key={index} className="bg-green-50 text-green-700 py-1 px-3 rounded-full text-sm flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {skill}
                          </span>
                        ))}
                        {comparisonResult.skills_comparison.matching_skills.length === 0 && (
                          <p className="text-gray-500 text-sm">No matching skills found</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparisonResult.skills_comparison.missing_skills.map((skill, index) => (
                          <span key={index} className="bg-red-50 text-red-700 py-1 px-3 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {comparisonResult.skills_comparison.missing_skills.length === 0 && (
                          <p className="text-gray-500 text-sm">No missing skills found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {comparisonResult.skills_comparison && comparisonResult.skills_comparison.skill_gap_percentage !== undefined && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Skill Gap</span>
                      <span className="text-sm font-medium">{comparisonResult.skills_comparison.skill_gap_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${100 - comparisonResult.skills_comparison.skill_gap_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Experience Analysis */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                  Experience Analysis
                </h3>

                {comparisonResult.experience_analysis && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Alignment with Target Role</h4>
                      <p className="text-gray-700">{comparisonResult.experience_analysis.alignment}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Experience Gaps</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.experience_analysis.gaps.map((gap, index) => (
                          <li key={index} className="text-gray-700">{gap}</li>
                        ))}
                        {comparisonResult.experience_analysis.gaps.length === 0 && (
                          <p className="text-gray-500 text-sm">No significant experience gaps found</p>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Suggestions for Improvement</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.experience_analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Education Comparison */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                  Education Comparison
                </h3>

                {comparisonResult.education_comparison && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Analysis</h4>
                      <p className="text-gray-700">{comparisonResult.education_comparison.analysis}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Recommended Certifications/Education</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.education_comparison.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                        {comparisonResult.education_comparison.recommendations.length === 0 && (
                          <p className="text-gray-500 text-sm">No specific educational recommendations</p>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              <div className="mb-8 bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Actionable Recommendations
                </h3>

                {comparisonResult.actionable_recommendations && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-indigo-800 mb-2">Next Steps</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        {comparisonResult.actionable_recommendations.steps.map((step, index) => (
                          <li key={index} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-indigo-800 mb-2">Priority Skills to Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparisonResult.actionable_recommendations.priority_skills.map((skill, index) => (
                          <span key={index} className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-indigo-800 mb-2">Recommended Projects</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {comparisonResult.actionable_recommendations.recommended_projects.map((project, index) => (
                          <li key={index} className="text-gray-700">{project}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Your Strengths for this Role
                </h3>

                {comparisonResult.strengths && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="list-disc pl-5 space-y-1">
                      {comparisonResult.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                      {comparisonResult.strengths.length === 0 && (
                        <p className="text-gray-500 text-sm">No specific strengths identified</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LinkedinComp;
