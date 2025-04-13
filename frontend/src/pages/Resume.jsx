import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BarChart, RefreshCw, Download, CheckCircle, Target, Clock, AlertTriangle, TrendingUp, Star, Upload, ArrowRight, FileText } from 'react-feather';
import axios from 'axios';

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

const formatKey = (key) => {
    if (!key) return '';
    return key.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
    const widthValue = typeof value === 'string' && value.endsWith('%') ? value : '0%';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`}
                style={{ width: widthValue }}
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

    const handleKeyDown = (event) => {
        if (onRemove && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onRemove();
        }
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-sm ${colorMap[type]} flex items-center gap-2 group hover:shadow-md transition-shadow duration-200 ${onRemove ? 'cursor-pointer' : ''}`}
            onClick={onRemove}
            onKeyDown={handleKeyDown}
            role={onRemove ? "button" : undefined}
            tabIndex={onRemove ? 0 : undefined}
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
    const [jobDescription, setJobDescription] = useState('');
    const resumeFileRef = useRef(null);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    const [currentState, setCurrentState] = useState(1); // 1: Upload, 2: Job Description, 3: Analysis
    const [resumeFile, setResumeFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [fadeTransition, setFadeTransition] = useState('');

    const transitionToState = (nextState) => {
        setFadeTransition('opacity-0');
        setTimeout(() => {
            setCurrentState(nextState);
            setFadeTransition('opacity-100');
        }, 300);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setResumeFile(file);
            resumeFileRef.current = { files: [file] };
            transitionToState(2);
        } else {
            setError('Please upload a PDF or DOCX file.');
        }
    };

    const handleSubmitJobDescription = () => {
        if (jobDescription.trim().length < 30) {
            setError('Please provide a more detailed job description (at least 30 characters).');
            return;
        }
        setError(null);
        transitionToState(3);
    };

    const handleRefresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setHasAnalyzed(true);

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_description', jobDescription);

        const apiUrl = 'http://localhost:5000/api/analyze-resume';

        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.data || !response.data.analysis_result) {
                console.error('Invalid API response structure:', response.data);
                throw new Error('Received invalid data structure from the server.');
            }

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
            setData(initialData);
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription, resumeFile]);

    const handleRemoveKeyword = useCallback((type, keywordToRemove) => {
        setData(prevData => {
            const keywordMap = {
                present: 'present_keywords',
                missing: 'missing_keywords',
                suggested: 'suggested_keywords'
            };
            const keyToUpdate = keywordMap[type];

            if (!keyToUpdate || !prevData.resume_analysis?.keyword_analysis?.[keyToUpdate]) {
                return prevData;
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
    }, []);

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
            setError("Failed to generate export file.");
        }
    };

    const handleBackToUpload = () => {
        transitionToState(1);
        setResumeFile(null);
    };

    const handleBackToJobDescription = () => {
        transitionToState(2);
    };

    const analysis = data?.resume_analysis ?? initialData.resume_analysis;
    const quickOverview = analysis.quick_overview ?? {};
    const scoreBreakdown = analysis.score_breakdown ?? {};
    const successMetrics = analysis.success_metrics ?? {};
    const criticalGaps = analysis.critical_gaps ?? {};
    const keywordAnalysis = analysis.keyword_analysis ?? { present_keywords: [], missing_keywords: [], suggested_keywords: [] };
    const improvementPlan = analysis.improvement_plan ?? {};
    const customizedSuggestions = analysis.customized_suggestions ?? [];

    useEffect(() => {
        if (currentState === 3 && !hasAnalyzed && !isLoading) {
            handleRefresh();
        }
    }, [currentState, handleRefresh, hasAnalyzed, isLoading]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <BarChart className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resume Analysis</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                            <div className={`w-16 h-1 ${currentState >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                            <div className={`w-16 h-1 ${currentState >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentState >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className={`transition-opacity duration-300 ${fadeTransition}`}>
                    {currentState === 1 && (
                        <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto text-center">
                            <h2 className="text-xl font-semibold mb-6">Upload Your Resume</h2>
                            <div
                                className={`border-2 border-dashed rounded-lg p-10 transition-colors duration-200 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-blue-500 mb-4" />
                                    <p className="text-gray-700 mb-2">Drag and drop your resume here, or click to browse</p>
                                    <p className="text-gray-500 text-sm mb-4">Supports PDF, DOCX formats</p>
                                    <input
                                        type="file"
                                        id="resumeFile"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.docx"
                                    />
                                    <button
                                        onClick={() => document.getElementById('resumeFile').click()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
                                    >
                                        Select File
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentState === 2 && (
                        <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
                            <div className="flex items-center mb-6">
                                <button
                                    onClick={handleBackToUpload}
                                    className="mr-3 text-blue-600 hover:underline flex items-center"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Back
                                </button>
                                <h2 className="text-xl font-semibold flex-1">Job Description</h2>
                            </div>

                            <div className="mb-4 flex items-center text-sm text-gray-600">
                                <FileText className="w-4 h-4 mr-2" />
                                <span>Resume: {resumeFile?.name}</span>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="jobDescription">
                                    Paste the job description here:
                                </label>
                                <textarea
                                    id="jobDescription"
                                    rows="8"
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Include the full job description to get the most accurate analysis..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            <div className="text-right">
                                <button
                                    onClick={handleSubmitJobDescription}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 ml-auto"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentState === 3 && (
                        <div className="transition-all duration-500 ease-in-out">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <button
                                    onClick={handleBackToJobDescription}
                                    className="text-blue-600 hover:underline flex items-center"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> Edit Job Description
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    {isLoading ? 'Analyzing...' : 'Analyze Again'}
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!hasAnalyzed || isLoading || error}
                                >
                                    <Download className="w-4 h-4" />
                                    Export JSON
                                </button>
                            </div>

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm mb-8">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-700 font-medium">Analyzing your resume against the job description...</p>
                                    <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                                </div>
                            )}

                            {!isLoading && hasAnalyzed && (
                                <>
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

                                        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
                                            <div className="space-y-4">
                                                {Object.entries(scoreBreakdown).length > 0 ? (
                                                    Object.entries(scoreBreakdown).map(([key, value]) => {
                                                        const score = parseInt(value, 10);
                                                        const color = isNaN(score) ? 'bg-gray-500' : score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                                                        const displayValue = typeof value === 'string' ? value : 'N/A';
                                                        const widthValue = typeof value === 'string' && value.endsWith('%') ? value : '0%';

                                                        return (
                                                            <div key={key}>
                                                                <div className="flex justify-between text-sm mb-1">
                                                                    <span className="text-gray-600">{formatKey(key)}</span>
                                                                    <span className="font-medium">{displayValue}</span>
                                                                </div>
                                                                <ProgressBar
                                                                    value={widthValue}
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

                                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            Critical Gaps
                                        </h3>
                                        {typeof criticalGaps === 'object' && Object.keys(criticalGaps).length > 0 ? (
                                            <div className="space-y-6">
                                                {Object.values(criticalGaps).map((gap, index) => (
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
                                                    ) : null
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No critical gaps identified or data is unavailable.</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

                                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Improvement Plan</h3>
                                        {Object.keys(improvementPlan).length > 0 ? (
                                            <div className="space-y-8">
                                                {Object.entries(improvementPlan).map(([key, items]) => (
                                                    Array.isArray(items) && items.length > 0 ? (
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
                                                    ) : null
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No specific improvement plan available.</p>
                                        )}
                                    </div>

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
                    )}
                </div>
            </div>
        </div>
    );
}

export default Resume;