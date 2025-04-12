import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { analysisApi } from '../utils/api';

const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analysisApi.getAnalysisById(id);
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await analysisApi.deleteAnalysis(id);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting analysis:', err);
        alert('Failed to delete analysis. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error || 'Analysis not found'}</p>
                </div>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const matchedSkills = analysis.jobPost.parsedData.requiredSkills.filter(skill =>
    analysis.resume.parsedData.skills.some(userSkill =>
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-block mb-4">
              <span className="bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-sm font-medium">Analysis Results</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Skill Analysis</h1>
                <p className="text-lg text-gray-600">
                  {analysis.jobPost.title} at {analysis.jobPost.company}
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Delete Analysis
                </button>
              </div>
            </div>
          </div>

          {/* Skill Score Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-900">Your Skill Match</h2>
                <p className="text-gray-600">
                  Based on {analysis.resume.fileName} for {analysis.jobPost.title}
                </p>
              </div>
              <div className="flex items-center">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={analysis.skillScore >= 70 ? '#10B981' : analysis.skillScore >= 40 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="3"
                      strokeDasharray={`${analysis.skillScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{analysis.skillScore}%</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Match Level</div>
                  <div className="text-lg font-semibold">
                    {analysis.skillScore >= 80 ? 'Excellent' :
                     analysis.skillScore >= 60 ? 'Good' :
                     analysis.skillScore >= 40 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Matched Skills */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Matched Skills</h2>
              {matchedSkills.length === 0 ? (
                <p className="text-gray-500">No matched skills found.</p>
              ) : (
                <ul className="space-y-2">
                  {matchedSkills.map((skill, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-800">{skill}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills to Develop</h2>
              {analysis.skillGap.missing.length === 0 ? (
                <p className="text-gray-500">No skill gaps found.</p>
              ) : (
                <ul className="space-y-2">
                  {analysis.skillGap.missing.map((skill, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-800">{skill}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Learning Recommendations */}
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Recommendations</h2>
            {!analysis.recommendations || analysis.recommendations.length === 0 ? (
              <p className="text-gray-500">No recommendations available.</p>
            ) : (
              <div className="space-y-6">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{recommendation.skill}</h3>
                    <ul className="space-y-2">
                      {recommendation.resources.map((resource, resourceIndex) => (
                        <li key={resourceIndex} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {resource.type === 'course' ? (
                              <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              {resource.title}
                            </a>
                            <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-indigo-50 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">Focus on missing skills</p>
                  <p className="text-gray-600 text-sm">
                    Prioritize learning the skills that are required for the job but missing from your profile.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">Update your resume</p>
                  <p className="text-gray-600 text-sm">
                    Make sure your resume clearly highlights all your matching skills.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">Track your progress</p>
                  <p className="text-gray-600 text-sm">
                    Re-analyze your resume after learning new skills to see your improvement.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;