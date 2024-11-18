'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";

interface ReportPageProps {
  userData: {
    contactDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      age: string;
      address: string;
      company: string;
      jobTitle: string;
    };
    learnerData: {
      timeToLearn: string;
      motivation: string;
      interests: string;
      otherMotivation?: string;
      otherInterests?: string;
      device: string;
      contentType: string;
      classroomFormat: string;
    };
    speakingData?: any;
    listeningScore?: number;
    listeningCorrectAnswers?: number;
    readingScore?: number;
    readingCorrectAnswers?: number;
    writingData: {
      email: string;
      analysis?: string;
    };
    opinionData?: any;
  };
  onNext: () => void;
}

export default function ReportPage({ userData, onNext }: ReportPageProps) {
  const router = useRouter();
  const [displayData, setDisplayData] = useState(userData);
  const videoId = "kW2NUYoTmEY";

  useEffect(() => {
    // Try to load data from localStorage
    const contactDetails = JSON.parse(localStorage.getItem('contactDetails') || '{}');
    const learnerPreferences = JSON.parse(localStorage.getItem('learnerPreferences') || '{}');
    const technicalPreferences = JSON.parse(localStorage.getItem('technicalPreferences') || '{}');

    // Combine the data
    const combinedData = {
      ...userData,
      contactDetails: Object.keys(contactDetails).length > 0 ? contactDetails : userData.contactDetails,
      learnerData: {
        ...userData.learnerData,
        ...learnerPreferences,
        ...technicalPreferences
      }
    };

    console.log('Combined Report Data:', combinedData);
    setDisplayData(combinedData);
  }, [userData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Save data to localStorage
      localStorage.setItem('reportData', JSON.stringify(displayData));
      console.log('Saved data:', displayData); // Debug log
      
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
      // Create new PDF document with margins
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20; // 20mm margins
      const lineHeight = 7;
      let y = margin;

      // Helper function to add text with wrapping
      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        // Split long text into lines that fit within margins
        const lines = doc.splitTextToSize(text, pageWidth - (2 * margin));
        
        // Check if we need a new page
        if (y + (lines.length * lineHeight) > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        
        // Add each line
        lines.forEach(line => {
          doc.text(line, margin, y);
          y += lineHeight;
        });
        
        // Add extra space after paragraphs
        y += 3;
      };

      // Add title
      addWrappedText('Language Audit Report', 20, true);
      y += 5;

      // Add sections
      addWrappedText('Contact Details', 16, true);
      addWrappedText(`Name: ${displayData.contactDetails?.firstName || 'N/A'} ${displayData.contactDetails?.lastName || ''}`, 12);
      addWrappedText(`Email: ${displayData.contactDetails?.email || 'N/A'}`, 12);
      addWrappedText(`Phone: ${displayData.contactDetails?.phoneNumber || 'N/A'}`, 12);
      addWrappedText(`Age: ${displayData.contactDetails?.age || 'N/A'}`, 12);
      addWrappedText(`Company: ${displayData.contactDetails?.company || 'N/A'}`, 12);
      addWrappedText(`Job Title: ${displayData.contactDetails?.jobTitle || 'N/A'}`, 12);
      addWrappedText(`Address: ${displayData.contactDetails?.address || 'N/A'}`, 12);
      y += 5;

      addWrappedText('Learning Profile', 16, true);
      addWrappedText(`Time Available: ${displayData.learnerData?.timeToLearn || 'N/A'}`, 12);
      addWrappedText(`Motivation: ${displayData.learnerData?.motivation || 'N/A'}${
        displayData.learnerData?.motivation === 'other' && displayData.learnerData?.otherMotivation 
          ? ` - ${displayData.learnerData.otherMotivation}` 
          : ''
      }`, 12);
      addWrappedText(`Interests: ${displayData.learnerData?.interests || 'N/A'}${
        displayData.learnerData?.interests === 'other' && displayData.learnerData?.otherInterests 
          ? ` - ${displayData.learnerData.otherInterests}` 
          : ''
      }`, 12);
      y += 5;

      addWrappedText('Technical Preferences', 16, true);
      addWrappedText(`Preferred Device: ${displayData.learnerData?.device || 'N/A'}`, 12);
      addWrappedText(`Preferred Content Type: ${displayData.learnerData?.contentType || 'N/A'}`, 12);
      addWrappedText(`Preferred Class Format: ${displayData.learnerData?.classroomFormat || 'N/A'}`, 12);
      y += 5;

      addWrappedText('Difficulties to focus on', 16, true);
      addWrappedText(`Response: ${displayData.speakingData?.transcription || 'N/A'}`, 12);
      y += 5;

      addWrappedText('Opinion Assessment', 16, true);
      addWrappedText(`Your Response: ${displayData.opinionData?.transcription || 'No response recorded'}`, 12);
      addWrappedText(`Analysis: ${displayData.opinionData?.analysis || 'Analysis pending...'}`, 12);
      y += 5;

      addWrappedText('SpeechAce Analysis', 16, true);
      addWrappedText(`Pronunciation Score: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 'N/A'}/100`, 12);
      addWrappedText(`Fluency Score: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 'N/A'}/100`, 12);
      y += 5;

      addWrappedText('IELTS Equivalent', 16, true);
      addWrappedText(`Pronunciation: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 'N/A'}/9`, 12);
      addWrappedText(`Fluency: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 'N/A'}/9`, 12);
      y += 5;

      addWrappedText('CEFR Level', 16, true);
      addWrappedText(`Pronunciation: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation || 'N/A'}`, 12);
      addWrappedText(`Fluency: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency || 'N/A'}`, 12);
      y += 5;

      addWrappedText('Speech Pattern Analysis', 16, true);
      addWrappedText(`Speech Rate: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.speech_rate?.toFixed(1) || 'N/A'} words/second`, 12);
      addWrappedText(`Pauses: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.all_pause_count || 'N/A'} pauses`, 12);
      addWrappedText(`Average Run Length: ${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.mean_length_run?.toFixed(1) || 'N/A'} words`, 12);
      y += 5;

      addWrappedText('Test Scores', 16, true);
      addWrappedText(`Listening Score: ${displayData?.listeningScore || 0}/10`, 12);
      addWrappedText(`Reading Score: ${displayData?.readingScore || 0}/10`, 12);
      y += 5;

      addWrappedText('Writing Assessment', 16, true);
      addWrappedText(`Email Response: ${displayData.writingData?.email || 'N/A'}`, 12);
      
      // Add the OpenAI analysis
      if (displayData.writingData?.analysis) {
        y += 5;
        addWrappedText('AI Analysis:', 14, true);
        addWrappedText(displayData.writingData.analysis, 12);
      }

      addWrappedText(`Analysis: ${displayData.writingData?.analysis || 'N/A'}`, 12);
      y += 5;

      addWrappedText(`Generated on: ${new Date().toLocaleDateString()}`, 12);

      // Save the PDF
      doc.save('language-audit-report.pdf');

    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  useEffect(() => {
    // Debug logs
    console.log('ReportPage userData:', userData);
    console.log('Contact Details:', userData.contactDetails);
    console.log('Learner Data:', userData.learnerData);
    
    // Check localStorage directly
    console.log('localStorage contactDetails:', JSON.parse(localStorage.getItem('contactDetails') || '{}'));
    console.log('localStorage learnerPreferences:', JSON.parse(localStorage.getItem('learnerPreferences') || '{}'));
    console.log('localStorage technicalPreferences:', JSON.parse(localStorage.getItem('technicalPreferences') || '{}'));
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Your Assessment Report</h1>

        {/* Video Container - Centered */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <div 
            className="w-full flex justify-center"
            role="region"
            aria-label="Assessment Report Video"
          >
            <iframe
              width="800"
              height="400"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Assessment Report Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
              tabIndex={0}
            />
          </div>
        </div>

        {/* Main Report Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Contact Details Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Name:</strong> {displayData.contactDetails?.firstName || 'N/A'} {displayData.contactDetails?.lastName || ''}</p>
              <p><strong>Email:</strong> {displayData.contactDetails?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {displayData.contactDetails?.phoneNumber || 'N/A'}</p>
              <p><strong>Age:</strong> {displayData.contactDetails?.age || 'N/A'}</p>
              <p><strong>Company:</strong> {displayData.contactDetails?.company || 'N/A'}</p>
              <p><strong>Job Title:</strong> {displayData.contactDetails?.jobTitle || 'N/A'}</p>
            </div>
            <div className="mt-4">
              <p><strong>Address:</strong> {displayData.contactDetails?.address || 'N/A'}</p>
            </div>
          </div>

          {/* Learner Data Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Learning Profile</h2>
            <div className="space-y-2">
              <p><strong>Time Available:</strong> {displayData.learnerData?.timeToLearn || 'N/A'}</p>
              <p>
                <strong>Motivation:</strong> {displayData.learnerData?.motivation || 'N/A'}
                {displayData.learnerData?.motivation === 'other' && displayData.learnerData?.otherMotivation && (
                  <span className="ml-2">- {displayData.learnerData.otherMotivation}</span>
                )}
              </p>
              <p>
                <strong>Interests:</strong> {displayData.learnerData?.interests || 'N/A'}
                {displayData.learnerData?.interests === 'other' && displayData.learnerData?.otherInterests && (
                  <span className="ml-2">- {displayData.learnerData.otherInterests}</span>
                )}
              </p>
            </div>
          </div>

          {/* Technical Preferences Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Technical Preferences</h2>
            <div className="space-y-2">
              <p><strong>Preferred Device:</strong> {displayData.learnerData?.device || 'N/A'}</p>
              <p><strong>Preferred Content Type:</strong> {displayData.learnerData?.contentType || 'N/A'}</p>
              <p><strong>Preferred Class Format:</strong> {displayData.learnerData?.classroomFormat || 'N/A'}</p>
            </div>
          </div>

          {/* Difficulties to focus on Section (formerly Speaking Assessment) */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Difficulties to focus on</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Response:</h3>
                <p className="bg-gray-50 p-4 rounded">{displayData.speakingData?.transcription || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Opinion Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Expressing an Opinion</h2>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Response:</h2>
              <p className="text-gray-700 mb-4">{displayData.opinionData?.transcription || 'No response recorded'}</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">OpenAI Analysis:</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {displayData.opinionData?.analysis || 'Analysis pending...'}
              </p>
            </div>
          </div>

          {/* SpeechAce Analysis Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">SpeechAce Analysis:</h2>
            
            {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation && (
              <div className="space-y-6">
                {/* Original Text */}
                <div>
                  <h3 className="font-medium mb-2">Your Transcript</h3>
                  <p className="p-4 bg-gray-50 rounded">
                    {displayData.opinionData.transcription || 'No text available'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Word count: {displayData.opinionData.transcription?.split(/\s+/).filter(word => word.length > 0).length || 0} words
                  </p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* SpeechAce Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 90 &&
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 90
                      ? 'bg-green-50'
                      : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 80 &&
                        (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 80
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">SpeechAce Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 90
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 0) >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 'N/A'}/100
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 90
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 0) >= 80
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 'N/A'}/100
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* IELTS Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 8 &&
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 8
                      ? 'bg-green-50'
                      : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 6.5 &&
                        (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 6.5
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">IELTS Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 8
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 0) >= 6.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 'N/A'}/9
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 8
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 0) >= 6.5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 'N/A'}/9
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* TOEIC Scores */}
                  <div className={`p-4 border rounded shadow ${
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 180 &&
                    (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 180
                      ? 'bg-green-50'
                      : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 150 &&
                        (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 150
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">TOEIC Score</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 180
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 0) >= 150
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 'N/A'}/200
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 180
                            ? 'bg-green-100 text-green-800'
                            : (displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 0) >= 150
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 'N/A'}/200
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* CEFR Level */}
                  <div className={`p-4 border rounded shadow ${
                    displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('C') &&
                    displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('C')
                      ? 'bg-green-50'
                      : displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('B') &&
                        displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('B')
                      ? 'bg-yellow-50'
                      : 'bg-red-50'
                  }`}>
                    <h3 className="font-medium mb-2">CEFR Level</h3>
                    <div className="space-y-2">
                      <p>Pronunciation: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('C')
                            ? 'bg-green-100 text-green-800'
                            : displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation?.startsWith('B')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation || 'N/A'}
                        </span>
                      </p>
                      <p>Fluency: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                          displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('C')
                            ? 'bg-green-100 text-green-800'
                            : displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency?.startsWith('B')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency || 'N/A'}
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
                      <p><strong>Speech Rate:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.speech_rate?.toFixed(1) || 'N/A'} words/second</p>
                      <p><strong>Pauses:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.all_pause_count || 'N/A'} pauses</p>
                      <p><strong>Average Run Length:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.mean_length_run?.toFixed(1) || 'N/A'} words</p>
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
                        {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ? `${(displayData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list
                              .filter(word => word.quality_score >= 90).length /
                              displayData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list.length * 100
                            ).toFixed(1)}%`
                          : 'N/A'
                        }
                      </div>
                      <p className="text-sm text-blue-600 mt-1">Words pronounced correctly</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Words Needing Attention</h4>
                      <div className="text-2xl font-bold text-yellow-900">
                        {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ?.filter(word => word.quality_score < 90).length || 0}
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">Words below 90% accuracy</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Average Word Score</h4>
                      <div className="text-2xl font-bold text-green-900">
                        {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
                          ? `${(displayData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list
                              .reduce((acc, word) => acc + word.quality_score, 0) /
                              displayData.opinionData.speechAceAnalysis.analysis.text_score.word_score_list.length
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
                        {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.word_score_list
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
            <p className="mb-2">You answered {displayData?.listeningCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {displayData?.listeningScore || 0}/10</p>
          </div>

          {/* Reading Comprehension Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Reading Comprehension</h2>
            <p className="mb-2">You answered {displayData?.readingCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {displayData?.readingScore || 0}/10</p>
          </div>

          {/* Writing Assessment Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Writing Assessment</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Email:</h3>
                <p className="bg-gray-50 p-4 rounded whitespace-pre-wrap">{displayData.writingData?.email || 'N/A'}</p>
              </div>
              {displayData.writingData?.analysis && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Analysis:</h3>
                  <p className="bg-gray-50 p-4 rounded">{displayData.writingData.analysis}</p>
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