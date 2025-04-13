import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const JobPostPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    jobUrl: ''
  }); // Removed <FormData> and replaced with an object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await jobApi.createJobPost(formData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating job post:', err);
      setError('Failed to create job post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="inline-block mb-4">
              <span className="bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-sm font-medium">Add Job Post</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Job Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Enter details about a job you're interested in to analyze your skill match.
            </p>
          </div>
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Job post created successfully! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="e.g., Frontend Developer"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="e.g., Acme Inc."
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700">
                    Job URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      id="jobUrl"
                      name="jobUrl"
                      value={formData.jobUrl}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="e.g., https://example.com/jobs/frontend-developer"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Link to the job posting
                  </p>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={10}
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="Paste the full job description here..."
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Paste the complete job description for best results
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Job Post'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 bg-indigo-50 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for Better Analysis</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">Include complete description</p>
                  <p className="text-gray-600 text-sm">
                    Add the full job description for the most accurate skill matching.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">List all requirements</p>
                  <p className="text-gray-600 text-sm">
                    Make sure to include both required and preferred qualifications.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-600 font-bold text-sm">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">Add company details</p>
                  <p className="text-gray-600 text-sm">
                    Include company information for better context and matching.
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

export default JobPostPage;