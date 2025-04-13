import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, ArrowRight, Menu } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold">FitCheck</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/login" className="hidden md:block bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center">
            Log in
          </Link>
          <Menu className="md:hidden w-6 h-6" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <span className="bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-sm font-medium">Welcome</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              A better way to build your career
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Create professional resumes in minutes with our AI-powered platform. Stand out from the crowd and land your dream job with beautifully crafted resumes tailored to your industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                Try FitCheck
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="relative">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Om Bhanushali</h2>
                  <p className="text-gray-600">Software Engineer @Google</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Expert @Codeforces</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Full-stack development</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Team leadership</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Skills</span>
                    <span className="text-sm text-gray-500">Expert Level</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -z-10 top-8 -right-4 w-72 h-72 bg-indigo-50 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 bottom-8 -left-4 w-72 h-72 bg-blue-50 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;