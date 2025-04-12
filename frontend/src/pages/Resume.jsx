import React, { useState } from 'react';
import { BarChart, RefreshCw, Download, CheckCircle, Target, Clock, AlertTriangle, TrendingUp, Star } from 'react-feather';

const initialData = {
    "resume_analysis": {
      "quick_overview": {
        "job_title_match": "Low",
        "industry_fit": "Medium",
        "experience_level_match": "Low"
      },
      "score_breakdown": {
        "overall_ATS_score": "55%",
        "skills_match": "65%",
        "experience_match": "40%",
        "education_match": "70%"
      },
      "critical_gaps": {
        "gap_1": {
          "description": "The resume lacks explicitly stated experience in a Frontend Developer role. The candidate's experience is primarily in tech teams and student chapters, not specifically as a Frontend Developer.",
          "suggestions": "Reframe current experience to highlight frontend development aspects. For example, emphasize web development projects and contributions to those projects, detailing the frontend technologies used (React, etc.)."
        },
        "gap_2": {
          "description": "The job description requires 2+ years of experience in frontend development, and the resume does not clearly demonstrate this level of professional experience.",
          "suggestions": "Quantify the time spent on relevant projects. While the candidate may not have 'professional' experience, highlight time invested in personal projects, open-source contributions, or freelance work if applicable. Even estimated hours can strengthen the application."   
        },
        "gap_3": {
          "description": "The resume mentions React but does not explicitly highlight Tailwind CSS or TypeScript, both mentioned in the job description. Also, experience with REST APIs and Next.js are not mentioned in the resume.",
          "suggestions": "Add Tailwind CSS and TypeScript to the skills section if proficient. If the candidate has experience with REST APIs or Next.js, add them to the skills and experience sections, providing context on how they were used in projects."
        }
      },
      "keyword_analysis": {
        "present_keywords": ["React", "Web", "Development", "Git", "GitHub"],
        "missing_keywords": ["Frontend", "Tailwind CSS", "TypeScript", "REST APIs", "Next.js", "Responsive Web Design", "User Experience", "UI"],   
        "suggested_keywords": ["UI Development", "Component Libraries", "State Management", "Agile Development", "Cross-Browser Compatibility"]     
      },
      "improvement_plan": {
        "immediate_changes": ["Add Tailwind CSS and TypeScript to skills if applicable.", "Refocus the objective to directly address the Frontend Developer role at TechNova Solutions.", "Quantify project experience with estimated hours or timelines."],
        "short_term_improvements": ["Create a portfolio website showcasing frontend projects, emphasizing design and user experience.", "Contribute to open-source projects using React, Tailwind CSS, and TypeScript."],
        "long_term_development": ["Gain professional experience through internships or freelance work.", "Obtain certifications in relevant technologies (e.g., React, TypeScript)."]
      },
      "success_metrics": {
        "current_application_success_rate": "5%",
        "expected_success_after_improvements": "40%",
        "time_to_implement_all_changes": "4-6 weeks"
      },
      "customized_suggestions": ["Tailor the 'Projects' section to emphasize frontend aspects, especially those aligning with TechNova's technology stack. Showcase the candidate's understanding of UI/UX principles in project descriptions."]
    }
  };

function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    const statusMap = {
      'Low': 'bg-red-100 text-red-700',
      'High': 'bg-green-100 text-green-700',
      'Entry-Level': 'bg-yellow-100 text-yellow-700',
      'Medium': 'bg-orange-100 text-orange-700'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
        style={{ width: value }}
      />
    </div>
  );
}

function KeywordBadge({ keyword, type, onRemove }) {
  const colorMap = {
    present: 'bg-green-100 text-green-700',
    missing: 'bg-red-100 text-red-700',
    suggested: 'bg-blue-100 text-blue-700'
  };

  return (
    <span 
      className={`px-3 py-1 rounded-full text-sm ${colorMap[type]} flex items-center gap-2 group hover:shadow-md transition-shadow duration-200`}
      onClick={onRemove}
      role={onRemove ? "button" : undefined}
      tabIndex={onRemove ? 0 : undefined}
    >
      {keyword}
      {onRemove && (
        <span className="opacity-0 group-hover:opacity-100 cursor-pointer">×</span>
      )}
    </span>
  );
}

function Resume() {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(initialData);
      setIsLoading(false);
    }, 1000);
  };

  const handleRemoveKeyword = (type, keyword) => {
    setData(prevData => ({
      ...prevData,
      resume_analysis: {
        ...prevData.resume_analysis,
        keyword_analysis: {
          ...prevData.resume_analysis.keyword_analysis,
          [type === 'present' ? 'present_keywords' : type === 'missing' ? 'missing_keywords' : 'suggested_keywords']:
            prevData.resume_analysis.keyword_analysis[
              type === 'present' ? 'present_keywords' : type === 'missing' ? 'missing_keywords' : 'suggested_keywords'
            ].filter(k => k !== keyword)
        }
      }
    }));
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Resume Analysis Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">Comprehensive analysis and improvement suggestions for your resume</p>
        </header>

        {/* Quick Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
            <div className="space-y-3">
              {Object.entries(data.resume_analysis.quick_overview).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-600">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  <StatusBadge status={value} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(data.resume_analysis.score_breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <ProgressBar
                    value={value}
                    color={parseInt(value) >= 70 ? 'bg-green-500' : parseInt(value) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Success Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Current Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.resume_analysis.success_metrics.current_application_success_rate}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Target className="w-4 h-4" />
                  <span>Expected After Improvements</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{data.resume_analysis.success_metrics.expected_success_after_improvements}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time to Implement</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{data.resume_analysis.success_metrics.time_to_implement_all_changes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Gaps Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Critical Gaps</h3>
          <div className="space-y-6">
            {Object.values(data.resume_analysis.critical_gaps).map((gap, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{gap.description}</h4>
                  <p className="text-gray-600">{gap.suggestions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Present Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.resume_analysis.keyword_analysis.present_keywords.map((keyword) => (
                <KeywordBadge 
                  key={keyword} 
                  keyword={keyword} 
                  type="present" 
                  onRemove={() => handleRemoveKeyword('present', keyword)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.resume_analysis.keyword_analysis.missing_keywords.map((keyword) => (
                <KeywordBadge 
                  key={keyword} 
                  keyword={keyword} 
                  type="missing"
                  onRemove={() => handleRemoveKeyword('missing', keyword)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.resume_analysis.keyword_analysis.suggested_keywords.map((keyword) => (
                <KeywordBadge 
                  key={keyword} 
                  keyword={keyword} 
                  type="suggested"
                  onRemove={() => handleRemoveKeyword('suggested', keyword)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Improvement Plan */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Improvement Plan</h3>
          <div className="space-y-8">
            {Object.entries(data.resume_analysis.improvement_plan).map(([key, items]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Customized Suggestions */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Customized Suggestions
          </h3>
          <div className="space-y-4">
            {data.resume_analysis.customized_suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3">
                <Star className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resume;