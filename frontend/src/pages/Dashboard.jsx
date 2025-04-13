import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Briefcase, BarChart3, Upload, Plus, ExternalLink, Menu, LogOut, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Mock data and states
  const [resumes] = useState([
    { _id: '1', fileName: 'resume_2024.pdf', createdAt: '2024-03-15T10:00:00Z' }
  ]);
  const [jobPosts] = useState([
    { _id: '1', title: 'Senior Frontend Developer', company: 'Tech Corp', createdAt: '2024-03-14T10:00:00Z' }
  ]);
  const [analyses] = useState([
    { 
      _id: '1', 
      skillScore: 85,
      resume: { fileName: 'resume_2024.pdf' },
      jobPost: { title: 'Senior Frontend Developer', company: 'Tech Corp' },
      createdAt: '2024-03-15T12:00:00Z'
    }
  ]);
  
  // Get user's name from their profile if available
  const getUserName = () => {
    if (!user) return 'there';
    
    // Check if user has user_metadata with a name
    if (user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Fallbacks in order of preference
    return user.user_metadata?.name || user.email?.split('@')[0] || 'there';
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {getUserName()}!</h1>
          <p className="text-gray-600 mt-2">Analyse & compare your resume with the best in game.</p>
        </div>

        

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="w-full gap-4 flex flex-col">
            <Link to="/resume" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span className="ml-3 font-medium text-indigo-600">Resume Analysis</span>
            </Link>
            <Link to="/linkedin-comparison" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <RefreshCcw className="w-5 h-5 text-indigo-600" />
              <span className="ml-3 font-medium text-indigo-600">Professional Profile Sync</span>
            </Link>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Analyses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyses.map((analysis) => (
                  <tr key={analysis._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analysis.resume.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {analysis.jobPost.title} - {analysis.jobPost.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${analysis.skillScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{analysis.skillScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/analysis/${analysis._id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Resumes */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Resumes</h2>
              <Link to="/resume/upload" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                + Add New
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {resumes.map((resume) => (
                <div key={resume._id} className="px-6 py-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resume.fileName}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Job Posts */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Job Posts</h2>
              <Link to="/job/create" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                + Add New
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {jobPosts.map((job) => (
                <div key={job._id} className="px-6 py-4">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;