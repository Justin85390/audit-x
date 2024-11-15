'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReportPageProps {
  userData: {
    contactDetails?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    };
    learnerData?: {
      timeToLearn?: string;
      motivation?: string;
      interests?: string;
    };
    speakingData?: any;
    listeningScore?: number;
    listeningCorrectAnswers?: number;
    readingScore?: number;
    readingCorrectAnswers?: number;
    writingData?: any;
    opinionData?: any;
  };
  onNext: () => void;
}

export default function ReportPage({ userData, onNext }: ReportPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(userData || null);
  const videoId = "kW2NUYoTmEY";

  // Load data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('reportData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
      console.log('Loaded data in ReportPage:', parsedData);
    }
  }, []);

  // Add this for debugging
  useEffect(() => {
    console.log('Current userData:', userData);
    console.log('Current formData:', formData);
  }, [userData, formData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Save data to localStorage
      localStorage.setItem('reportData', JSON.stringify(formData));
      console.log('Saved data:', formData); // Debug log
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Optional: Clear data when starting a new session
  // Add this somewhere appropriate in your app (maybe _app.tsx or index.tsx)
  const clearStoredData = () => {
    localStorage.removeItem('reportData');
  };

  const handleDownload = () => {
    try {
      // Convert the report data to a string
      const reportText = JSON.stringify(formData, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([reportText], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'language-audit-report.json';
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Report</h1>

        {/* Video Container */}
        <div className="w-full flex justify-center mb-8">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Main Report Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Contact Details Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Name:</strong> {userData.contactDetails?.firstName || 'N/A'} {userData.contactDetails?.lastName || ''}</p>
              <p><strong>Email:</strong> {userData.contactDetails?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {userData.contactDetails?.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Learner Data Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Learning Profile</h2>
            <div className="space-y-2">
              <p><strong>Time Available:</strong> {userData.learnerData?.timeToLearn || 'N/A'}</p>
              <p><strong>Motivation:</strong> {userData.learnerData?.motivation || 'N/A'}</p>
              <p><strong>Interests:</strong> {userData.learnerData?.interests || 'N/A'}</p>
            </div>
          </div>

          {/* Difficulties to focus on Section (formerly Speaking Assessment) */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Difficulties to focus on</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Response:</h3>
                <p className="bg-gray-50 p-4 rounded">{userData.speakingData?.transcription || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Opinion Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Expressing an Opinion</h2>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Response:</h2>
              <p className="text-gray-700 mb-4">{userData.opinionData?.transcription || 'No response recorded'}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">OpenAI Analysis:</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {userData.opinionData?.analysis || 'Analysis pending...'}
              </p>
            </div>
          </div>

          {/* SpeechAce Analysis Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SpeechAce Analysis:</h2>
            
            {userData?.opinionData?.speechAceAnalysis?.analysis && (
              <div className="space-y-6">
                {/* Original Text */}
                <div>
                  <h3 className="font-medium mb-2">Your Transcript</h3>
                  <p className="p-4 bg-gray-50 rounded">
                    {userData.opinionData.transcription || 'No text available'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Word count: {userData.opinionData.transcription?.split(/\s+/).filter(word => word.length > 0).length || 0} words
                  </p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* SpeechAce Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 90 &&
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 90
                      ? 'bg-green-50'
                      : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 80 &&
                        (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 80
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">SpeechAce Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 90
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 'N/A'}/100
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 90
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 'N/A'}/100
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* IELTS Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 8 &&
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 8
                      ? 'bg-green-50'
                      : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 6.5 &&
                        (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 6.5
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">IELTS Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 8
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 6.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 'N/A'}/9
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 8
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 6.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 'N/A'}/9
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* TOEIC Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 180 &&
                    (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 180
                      ? 'bg-green-50'
                      : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 150 &&
                        (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 150
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">TOEIC Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 180
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 150
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 'N/A'}/200
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 180
                            ? 'bg-green-100 text-green-800'
                            : (userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 150
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 'N/A'}/200
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* CEFR Level */}
                  <div className={`p-4 border rounded shadow ${
                    userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('C') &&
                    userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('C')
                      ? 'bg-green-50'
                      : userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('B') &&
                        userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('B')
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">CEFR Level</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('C')
                            ? 'bg-green-100 text-green-800'
                            : userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('B')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation || 'N/A'}
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('C')
                            ? 'bg-green-100 text-green-800'
                            : userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('B')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speech Pattern Visualization */}
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Speech Pattern Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-3">
                      <p><strong>Speech Rate:</strong> {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.speech_rate?.toFixed(1) || 'N/A'} words/second</p>
                      <p><strong>Pauses:</strong> {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.all_pause_count || 'N/A'} pauses</p>
                      <p><strong>Average Run Length:</strong> {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.mean_length_run?.toFixed(1) || 'N/A'} words</p>
                    </div>
                  </div>
                </div>

                {/* Problematic Words Analysis */}
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Pronunciation Details</h3>
                  
                  {/* Summary Statistics */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Overall Word Accuracy</h4>
                      <div className="text-2xl font-bold text-blue-900">
                        {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ? `${(userData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list
                              .filter(word => word.quality_score >= 90).length /
                              userData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list.length * 100
                            ).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                      <p className="text-sm text-blue-600 mt-1">Words pronounced correctly</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Words Needing Attention</h4>
                      <div className="text-2xl font-bold text-yellow-900">
                        {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ?.filter(word => word.quality_score < 90).length || 0}
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">Words below 90% accuracy</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Average Word Score</h4>
                      <div className="text-2xl font-bold text-green-900">
                        {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ? `${(userData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list
                              .reduce((acc, word) => acc + word.quality_score, 0) /
                              userData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list.length
                            ).toFixed(1)}/100`
                          : 'N/A'
                        }
                      </div>
                      <p className="text-sm text-green-600 mt-1">Average pronunciation score</p>
                    </div>
                  </div>

                  {/* Existing Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Word
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Syllable Breakdown
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ?.filter(word => word.quality_score < 90)
                          .map((word, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {word.word}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  word.quality_score >= 80 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {word.quality_score}/100
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="flex flex-wrap gap-2">
                                  {word.syllable_score_list?.map((syllable, sIndex) => (
                                    <span key={sIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                                      {syllable.letters}
                                      <span className="ml-1 text-gray-500">
                                        ({syllable.quality_score}/100
                                        {syllable.stress_level !== undefined && 
                                          `, Stress: ${syllable.stress_level}`})
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listening Comprehension Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Listening Comprehension</h2>
            <p className="mb-2">You answered {userData?.listeningCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {userData?.listeningScore || 0}/10</p>
          </div>

          {/* Reading Comprehension Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Reading Comprehension</h2>
            <p className="mb-2">You answered {userData?.readingCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {userData?.readingScore || 0}/10</p>
          </div>

          {/* Writing Assessment Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Writing Assessment</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Email:</h3>
                <p className="bg-gray-50 p-4 rounded whitespace-pre-wrap">{userData.writingData?.email || 'N/A'}</p>
              </div>
              {userData.writingData?.analysis && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Analysis:</h3>
                  <p className="bg-gray-50 p-4 rounded">{userData.writingData.analysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px]"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}