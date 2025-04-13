import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ResumeImprovement = () => {
  const [resumeText, setResumeText] = useState('');
  const [improvedResume, setImprovedResume] = useState('');
  const [loading, setLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const handleResumeImprovement = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Please improve the following resume text while maintaining its professional tone and key information. 
      Focus on enhancing clarity, impact, and professional presentation. Here's the resume:
      
      ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const improvedText = response.text();
      
      setImprovedResume(improvedText);
    } catch (error) {
      console.error('Error improving resume:', error);
      alert('An error occurred while improving your resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Resume Improvement with AI</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Resume</h2>
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>

        <button
          onClick={handleResumeImprovement}
          disabled={loading || !resumeText.trim()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Improving...' : 'Improve Resume'}
        </button>

        {improvedResume && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Improved Resume</h2>
            <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
              {improvedResume}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeImprovement; 