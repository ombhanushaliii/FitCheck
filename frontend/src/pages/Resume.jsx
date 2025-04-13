import React, { useState, useRef, useCallback } from 'react';
import { BarChart, RefreshCw, Download, CheckCircle, Target, Clock, AlertTriangle, TrendingUp, Star } from 'react-feather';
import axios from 'axios'; // Import axios for API calls

// Initial data structure (remains the same)
const initialData = {
    resume_analysis: {
        quick_overview: {},
        score_breakdown: {},
        critical_gaps: {},
        keyword_analysis: {
            present_keywords: [],
            missing_keywords: [],
            suggested_keywords: []
        },
        improvement_plan: {},
        success_metrics: {},
        customized_suggestions: []
    }
};

// Helper function to format snake_case keys to Title Case
const formatKey = (key) => {
    if (!key) return '';
    return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// StatusBadge Component (remains the same)
function StatusBadge({ status }) {
    const getStatusColor = (status) => {
        const statusMap = {
            'Low': 'bg-red-100 text-red-700',
            'High': 'bg-green-100 text-green-700',
            'Entry-Level': 'bg-yellow-100 text-yellow-700',
            'Medium': 'bg-orange-100 text-orange-700'
            // Add more statuses if needed
        };
        return statusMap[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
            {status}
        </span>
    );
}

// ProgressBar Component (Add defensive check for value)
function ProgressBar({ value, color }) {
    // Ensure value is a string percentage, default to '0%' if invalid
    const widthValue = typeof value === 'string' && value.endsWith('%') ? value : '0%';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
                style={{ width: widthValue }} // Use the validated widthValue
            />
        </div>
    );
}

// KeywordBadge Component (Add keyboard accessibility)
function KeywordBadge({ keyword, type, onRemove }) {
    const colorMap = {
        present: 'bg-green-100 text-green-700',
        missing: 'bg-red-100 text-red-700',
        suggested: 'bg-blue-100 text-blue-700'
    };

    const handleKeyDown = (event) => {
        if (onRemove && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault(); // Prevent scrolling on spacebar
            onRemove();
        }
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-sm ${colorMap[type]} flex items-center gap-2 group hover:shadow-md transition-shadow duration-200 ${onRemove ? 'cursor-pointer' : ''}`}
            onClick={onRemove}
            onKeyDown={handleKeyDown} // Add keyboard handler
            role={onRemove ? "button" : undefined}
            tabIndex={onRemove ? 0 : undefined} // Make it focusable if removable
        >
            {keyword}
            {onRemove && (
                <span className="opacity-0 group-hover:opacity-100">×</span>
            )}
        </span>
    );
}

function Resume() {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobDescription, setJobDescription] = useState(''); // State for controlled textarea
    const resumeFileRef = useRef(null); // Ref for file input
    const [hasAnalyzed, setHasAnalyzed] = useState(false); // Track if analysis has run

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setHasAnalyzed(true); // Mark that an analysis attempt has been made

        const resumeFile = resumeFileRef.current?.files?.[0];

        if (!resumeFile) {
            setError('Please upload a resume file.');
            setIsLoading(false);
            return;
        }
        if (!jobDescription.trim()) {
            setError('Please provide a job description.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_description', jobDescription);

        // Make sure your API endpoint is correct
        // Consider using environment variables for the base URL
        const apiUrl = 'http://localhost:5000/api/analyze-resume'; // Ensure this matches the backend endpoint

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    // 'Content-Type': 'multipart/form-data' is usually set automatically by axios when using FormData
                },
            });

            // Adjust this check based on your actual API response structure
            if (!response.data || !response.data.analysis_result) {
                console.error('Invalid API response structure:', response.data);
                throw new Error('Received invalid data structure from the server.');
            }

            // Use optional chaining and nullish coalescing when setting state
            // to ensure the structure matches `initialData` even if API is missing parts
            setData({
                resume_analysis: {
                    quick_overview: response.data.analysis_result?.resume_analysis?.quick_overview ?? {},
                    score_breakdown: response.data.analysis_result?.resume_analysis?.score_breakdown ?? {},
                    critical_gaps: response.data.analysis_result?.resume_analysis?.critical_gaps ?? {},
                    keyword_analysis: {
                         present_keywords: response.data.analysis_result?.resume_analysis?.keyword_analysis?.present_keywords ?? [],
                         missing_keywords: response.data.analysis_result?.resume_analysis?.keyword_analysis?.missing_keywords ?? [],
                         suggested_keywords: response.data.analysis_result?.resume_analysis?.keyword_analysis?.suggested_keywords ?? [],
                    },
                    improvement_plan: response.data.analysis_result?.resume_analysis?.improvement_plan ?? {},
                    success_metrics: response.data.analysis_result?.resume_analysis?.success_metrics ?? {},
                    customized_suggestions: response.data.analysis_result?.resume_analysis?.customized_suggestions ?? [],
                }
            });

        } catch (err) {
            console.error('Error fetching resume analysis:', err);
            const message = err.response?.data?.error || err.message || 'Failed to fetch resume analysis. Please check the console and ensure the backend server is running.';
            setError(message);
            setData(initialData); // Reset data on error
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription]); // Add jobDescription as dependency

    const handleRemoveKeyword = useCallback((type, keywordToRemove) => {
        setData(prevData => {
            const keywordMap = {
                present: 'present_keywords',
                missing: 'missing_keywords',
                suggested: 'suggested_keywords'
            };
            const keyToUpdate = keywordMap[type];

            if (!keyToUpdate || !prevData.resume_analysis?.keyword_analysis?.[keyToUpdate]) {
                return prevData; // Should not happen with proper types, but good safeguard
            }

            return {
                ...prevData,
                resume_analysis: {
                    ...prevData.resume_analysis,
                    keyword_analysis: {
                        ...prevData.resume_analysis.keyword_analysis,
                        [keyToUpdate]: prevData.resume_analysis.keyword_analysis[keyToUpdate].filter(k => k !== keywordToRemove)
                    }
                }
            };
        });
    }, []); // No dependencies needed as it only uses arguments and setData

    const handleExport = () => {
        try {
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
        } catch (e) {
            console.error("Failed to export data:", e);
            setError("Failed to generate export file."); // Inform user
        }
    };

    // Destructure for easier access and use optional chaining with defaults
    const analysis = data?.resume_analysis ?? initialData.resume_analysis;
    const quickOverview = analysis.quick_overview ?? {};
    const scoreBreakdown = analysis.score_breakdown ?? {};
    const successMetrics = analysis.success_metrics ?? {};
    const criticalGaps = analysis.critical_gaps ?? {};
    const keywordAnalysis = analysis.keyword_analysis ?? { present_keywords: [], missing_keywords: [], suggested_keywords: [] };
    const improvementPlan = analysis.improvement_plan ?? {};
    const customizedSuggestions = analysis.customized_suggestions ?? [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
                    {/* Input fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="resumeFile">
                                Upload Resume (.pdf, .docx)
                            </label>
                            <input
                                type="file"
                                id="resumeFile"
                                ref={resumeFileRef} // Use ref
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept=".pdf,.docx" // Specify accepted formats
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="jobDescription">
                                Job Description
                            </label>
                            <textarea
                                id="jobDescription"
                                rows="4"
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Paste the job description here..."
                                value={jobDescription} // Controlled component
                                onChange={(e) => setJobDescription(e.target.value)} // Update state on change
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                             <BarChart className="w-8 h-8 text-blue-600" />
                             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resume Analysis</h1>
                         </div>
                         <div className="flex flex-wrap gap-3">
                             <button
                                 onClick={handleRefresh}
                                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                 disabled={isLoading}
                             >
                                 <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                 {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                             </button>
                             <button
                                 onClick={handleExport}
                                 className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                 disabled={!hasAnalyzed || isLoading || error} // Disable if no analysis run or loading/error
                             >
                                 <Download className="w-4 h-4" />
                                 Export JSON
                             </button>
                         </div>
                    </div>
                    {/* Keep the description if needed */}
                    {/* <p className="mt-2 text-gray-600">Get comprehensive analysis and improvement suggestions.</p> */}
                </header>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
                        <span>{error}</span>
                    </div>
                )}

                {!hasAnalyzed && !isLoading && !error && (
                     <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-center">
                         Upload your resume and paste the job description, then click "Analyze Resume" to see your results.
                     </div>
                )}

                 {/* Only show analysis sections if an analysis has been attempted */}
                 {hasAnalyzed && !error && (
                    <>
                        {/* Quick Overview Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
                                <div className="space-y-3">
                                    {Object.entries(quickOverview).length > 0 ? (
                                        Object.entries(quickOverview).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-gray-600">{formatKey(key)}</span>
                                                <StatusBadge status={value} />
                                            </div>
                                        ))
                                    ) : (
                                         <p className="text-gray-500 text-sm">No overview data available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Score Breakdown Section */}
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
                                <div className="space-y-4">
                                    {Object.entries(scoreBreakdown).length > 0 ? (
                                        Object.entries(scoreBreakdown).map(([key, value]) => {
                                            // Defensive check for progress bar value
                                            const score = parseInt(value, 10);
                                            const color = isNaN(score) ? 'bg-gray-500' : score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                                            const displayValue = typeof value === 'string' ? value : 'N/A'; // Display original value or N/A
                                            const widthValue = typeof value === 'string' && value.endsWith('%') ? value : '0%'; // Ensure valid % for style

                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">{formatKey(key)}</span>
                                                        <span className="font-medium">{displayValue}</span>
                                                    </div>
                                                    <ProgressBar
                                                        value={widthValue} // Pass the width string
                                                        color={color}
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                         <p className="text-gray-500 text-sm">No score data available.</p>
                                    )}
                                </div>
                            </div>

                             {/* Success Metrics Section */}
                             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Success Metrics</h3>
                                {Object.keys(successMetrics).length > 0 ? (
                                    <div className="space-y-4">
                                        {successMetrics.current_application_success_rate && (
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Current Success Rate</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">{successMetrics.current_application_success_rate}</p>
                                            </div>
                                        )}
                                         {successMetrics.expected_success_after_improvements && (
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Target className="w-4 h-4" />
                                                    <span>Expected After Improvements</span>
                                                </div>
                                                <p className="text-2xl font-bold text-green-600">{successMetrics.expected_success_after_improvements}</p>
                                            </div>
                                        )}
                                        {successMetrics.time_to_implement_all_changes && (
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Time to Implement</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-600">{successMetrics.time_to_implement_all_changes}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No success metrics available.</p>
                                )}
                            </div>
                        </div>

                         {/* Critical Gaps Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Critical Gaps
                             </h3>
                             {/* Check if critical_gaps is an object and has entries */}
                             {typeof criticalGaps === 'object' && Object.keys(criticalGaps).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.values(criticalGaps).map((gap, index) => (
                                        // Ensure gap has expected properties before rendering
                                        gap && gap.description && gap.suggestions ? (
                                            <div key={index} className="flex gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">{gap.description}</h4>
                                                    <p className="text-gray-600">{gap.suggestions}</p>
                                                </div>
                                            </div>
                                        ) : null // Don't render if gap structure is wrong
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No critical gaps identified or data is unavailable.</p>
                            )}
                        </div>


                        {/* Keywords Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {/* Present Keywords */}
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Present Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {keywordAnalysis.present_keywords?.length > 0 ? (
                                        keywordAnalysis.present_keywords.map((keyword) => (
                                            <KeywordBadge
                                                key={`present-${keyword}`}
                                                keyword={keyword}
                                                type="present"
                                                onRemove={() => handleRemoveKeyword('present', keyword)}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No relevant keywords found in the resume.</p>
                                    )}
                                </div>
                            </div>

                            {/* Missing Keywords */}
                             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Missing Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {keywordAnalysis.missing_keywords?.length > 0 ? (
                                        keywordAnalysis.missing_keywords.map((keyword) => (
                                            <KeywordBadge
                                                key={`missing-${keyword}`}
                                                keyword={keyword}
                                                type="missing"
                                                onRemove={() => handleRemoveKeyword('missing', keyword)}
                                            />
                                        ))
                                     ) : (
                                        <p className="text-gray-500 text-sm">No missing keywords identified.</p>
                                    )}
                                </div>
                            </div>

                            {/* Suggested Keywords */}
                             <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                     {keywordAnalysis.suggested_keywords?.length > 0 ? (
                                        keywordAnalysis.suggested_keywords.map((keyword) => (
                                            <KeywordBadge
                                                key={`suggested-${keyword}`}
                                                keyword={keyword}
                                                type="suggested"
                                                onRemove={() => handleRemoveKeyword('suggested', keyword)}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No additional keywords suggested.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Improvement Plan */}
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">Improvement Plan</h3>
                            {Object.keys(improvementPlan).length > 0 ? (
                                <div className="space-y-8">
                                    {Object.entries(improvementPlan).map(([key, items]) => (
                                        Array.isArray(items) && items.length > 0 ? ( // Check if items is a non-empty array
                                            <div key={key}>
                                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                                    {formatKey(key)}
                                                </h4>
                                                <ul className="list-disc list-inside space-y-2 text-gray-600 pl-2">
                                                    {items.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null // Don't render section if no items
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No specific improvement plan available.</p>
                            )}
                        </div>


                        {/* Customized Suggestions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Customized Suggestions
                            </h3>
                             {customizedSuggestions.length > 0 ? (
                                <div className="space-y-4">
                                    {customizedSuggestions.map((suggestion, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Star className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                                            <p className="text-gray-700">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No customized suggestions provided.</p>
                            )}
                        </div>
                    </>
                 )}
            </div>
        </div>
    );
}

export default Resume;