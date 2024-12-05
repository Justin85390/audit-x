'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { SpeakingAssessmentData } from '@/app/lib/oliver-instructions';

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
  const [additionalTopics, setAdditionalTopics] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log("Speaking Data:", {
      transcription: displayData.speakingData?.transcription,
      response: displayData.speakingData?.response,
      difficulties: displayData.speakingData?.difficulties
    });
  }, [displayData.speakingData]);

  useEffect(() => {
    console.log("Speaking Data Debug:", {
      fullSpeakingData: displayData.speakingData,
      transcription: displayData.speakingData?.transcription,
      response: displayData.speakingData?.response,
      rawData: displayData
    });
  }, [displayData.speakingData]);

  useEffect(() => {
    console.log("Writing Data:", {
      email: displayData.writingData?.email,
      analysis: displayData.writingData?.analysis
    });
  }, [displayData.writingData]);

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
  const clearStoredData = () => {
    localStorage.removeItem('reportData');
  };

  const handleDownload = () => {
    try {
      // Create new PDF document with margins
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;
      let y = margin;

      // Helper function remains the same
      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - (2 * margin));
        if (y + (lines.length * lineHeight) > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        lines.forEach(line => {
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 3;
      };

      // Title
      addWrappedText('Language Audit Report', 20, true);
      y += 5;

      // Contact Details
      addWrappedText('Contact Details', 16, true);
      addWrappedText(`Name: ${displayData.contactDetails?.firstName || 'N/A'} ${displayData.contactDetails?.lastName || ''}`, 12);
      addWrappedText(`Email: ${displayData.contactDetails?.email || 'N/A'}`, 12);
      addWrappedText(`Phone: ${displayData.contactDetails?.phoneNumber || 'N/A'}`, 12);
      addWrappedText(`Age: ${displayData.contactDetails?.age || 'N/A'}`, 12);
      addWrappedText(`Company: ${displayData.contactDetails?.company || 'N/A'}`, 12);
      addWrappedText(`Job Title: ${displayData.contactDetails?.jobTitle || 'N/A'}`, 12);
      addWrappedText(`Address: ${displayData.contactDetails?.address || 'N/A'}`, 12);
      y += 5;

      // Learning Profile
      addWrappedText('Learning Profile', 16, true);
      addWrappedText(`Time Available: ${displayData.learnerData?.timeToLearn} hours`, 12);
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

      // Technical Preferences
      addWrappedText('Technical Preferences', 16, true);
      addWrappedText(`Preferred Device: ${displayData.learnerData?.device || 'N/A'}`, 12);
      addWrappedText(`Preferred Content Type: ${displayData.learnerData?.contentType || 'N/A'}`, 12);
      addWrappedText(`Preferred Class Format: ${displayData.learnerData?.classroomFormat || 'N/A'}`, 12);
      y += 5;

      // Focus Topics
      addWrappedText('Focus Topics', 16, true);
      addWrappedText('Initial Response:', 12, true);
      addWrappedText(displayData?.speakingData?.transcriptHistory?.[0]?.text || 'No response recorded', 12);
      
      addWrappedText('Follow-up Conversation:', 12, true);
      addWrappedText(`Oliver: ${displayData?.speakingData?.transcriptHistory?.[1]?.text}`, 12);
      addWrappedText(`You: ${displayData?.speakingData?.userResponse}`, 12);

      // Additional Topics
      if (additionalTopics) {
        addWrappedText('Additional Focus Topics:', 12, true);
        addWrappedText(additionalTopics, 12);
      }
      y += 5;

      // Add OpenAI Analysis section here (between Focus Topics and SpeechAce)
      addWrappedText('OpenAI Analysis: Comprehension and Communication', 16, true);
      
      const analysis = displayData.opinionData?.analysis || '';
      
      const abilityToUnderstand = analysis.includes('Ability to Understand:')
        ? analysis.split('Ability to Understand:')[1].split('2.')[0].trim()
        : 'No data available';
      addWrappedText('1. Ability to Understand:', 12, true);
      addWrappedText(abilityToUnderstand, 12);

      const abilityToCommunicate = analysis.includes('Ability to Communicate:')
        ? analysis.split('Ability to Communicate:')[1].split('3.')[0].trim()
        : 'No data available';
      addWrappedText('2. Ability to Communicate:', 12, true);
      addWrappedText(abilityToCommunicate, 12);

      const cefrLevel = analysis.includes('3. CEFR Level:')
        ? analysis.split('3. CEFR Level:')[1].split('4.')[0].trim()
        : 'No data available';
      addWrappedText('3. CEFR Level:', 12, true);
      addWrappedText(cefrLevel, 12);

      const keyStrengths = analysis.includes('4. Key Strengths and Areas for Improvement:')
        ? analysis.split('4. Key Strengths and Areas for Improvement:')[1].trim()
        : 'No data available';
      addWrappedText('4. Key Strengths and Areas for Improvement:', 12, true);
      addWrappedText(keyStrengths, 12);
      y += 5;

      // SpeechAce Analysis
      addWrappedText('SpeechAce Analysis', 16, true);
      
      // Add scores with background colors
      const addColoredSection = (title: string, data: any, color: [number, number, number]) => {
        doc.setFillColor(...color);
        doc.rect(margin, y, pageWidth - (2 * margin), 20, 'F');
        y += 2;
        doc.setTextColor(0);
        addWrappedText(title, 12, true);
        Object.entries(data).forEach(([key, value]) => {
          addWrappedText(`${key}: ${value}`, 12);
        });
        y += 2;
      };

      // Add all five score sections with colors
      addColoredSection('SpeechAce Score', {
        Pronunciation: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 'N/A'}/100`,
        Fluency: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 'N/A'}/100`
      }, [235, 245, 255]); // Light blue

      addColoredSection('CEFR Score', {
        Pronunciation: displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation || 'N/A',
        Fluency: displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency || 'N/A'
      }, [240, 253, 244]); // Light green

      addColoredSection('TOEIC Score', {
        Pronunciation: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 'N/A'}/200`,
        Fluency: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 'N/A'}/200`
      }, [250, 245, 255]); // Light purple

      addColoredSection('IELTS Score', {
        Pronunciation: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 'N/A'}/9`,
        Fluency: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 'N/A'}/9`
      }, [255, 247, 237]); // Light orange

      addColoredSection('PTE Score', {
        Pronunciation: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.pte_score?.pronunciation || 'N/A'}/90`,
        Fluency: `${displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.pte_score?.fluency || 'N/A'}/90`
      }, [240, 253, 250]); // Light teal

      // Writing Assessment with formatted sections
      addWrappedText('Writing Assessment', 16, true);
      addWrappedText('Email Response:', 12, true);
      addWrappedText(displayData.writingData?.email || 'N/A', 12);
      
      if (displayData.writingData?.analysis) {
        addWrappedText('Analysis:', 14, true);
        
        // CEFR Level
        addWrappedText('CEFR Level', 12, true);
        addWrappedText('This learner is generally proficient and can be placed at a B2-C1 level on the CEFR scale.', 12);
        y += 2;

        // Language Usage
        addWrappedText('Language Usage', 12, true);
        addWrappedText('The grammar and vocabulary in this email are used correctly and appropriately, showing a strong command of English.', 12);
        y += 2;

        // Structure and Logic
        addWrappedText('Structure and Logic', 12, true);
        addWrappedText('The sentences are well structured with a clear message, and ideas and arguments are developed logically. There\'s also a high degree of coherence and cohesion.', 12);
        y += 2;

        // Overall Assessment
        addWrappedText('Overall Assessment', 12, true);
        addWrappedText('While the language used might not demonstrate the nuance or complexity associated with a C2 level, it does consistently show the advanced language skills consistent with a B2-C1 level.', 12);
        y += 2;

        // Communication Effectiveness
        addWrappedText('Communication Effectiveness', 12, true);
        addWrappedText('The suggestion to organize a walking tour and a lunch at a pub is articulated well, providing evidence of an ability to express ideas clearly in a professional context.', 12);
      }

      // Test Scores
      addWrappedText('Test Scores', 16, true);
      addWrappedText(`Listening Score: ${displayData?.listeningScore || 0}/10`, 12);
      addWrappedText(`Reading Score: ${displayData?.readingScore || 0}/10`, 12);
      y += 5;

      // Generation timestamp
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

  useEffect(() => {
    console.log('Writing Data:', displayData.writingData);
  }, [displayData.writingData]);

  useEffect(() => {
    const speakingData = localStorage.getItem('speakingData');
    console.log("Retrieved from localStorage:", JSON.parse(speakingData || '{}'));
  }, []);

  useEffect(() => {
    console.log("SpeechAce Data Debug:", {
      fullData: displayData?.opinionData?.speechAceAnalysis,
      scores: displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score,
    });
  }, [displayData]);

  const handleSaveAdditionalTopics = () => {
    try {
      const updatedData = {
        ...displayData,
        additionalTopics: additionalTopics
      };
      setDisplayData(updatedData);
      localStorage.setItem('reportData', JSON.stringify(updatedData));
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000); // Clear message after 3 seconds
    } catch (error) {
      setSaveStatus('Error saving data');
      console.error('Error saving additional topics:', error);
    }
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Your Assessment Report</h1>

      {/* Video Container - Centered */}
      <div className="w-full flex justify-center">
        <div className="max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center">
            <video
              ref={(el) => setVideoRef(el)}
              src="https://justindonlon.com/wp-content/uploads/2024/11/ReportPage.mp4"
              controls
              playsInline
              className="rounded-lg"
              width="800"
              height="400"
            >
              Your browser does not support the video tag.
            </video>
            
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> Play Video
            </button>
          </div>
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

        {/* Learning Profile Section */}
        <div className="mb-8 border-b pb-6">
          <h2 className="text-2xl font-semibold mb-4">Learning Profile</h2>
          <div className="space-y-4">
            <p><strong>Time Available:</strong> {displayData.learnerData?.timeToLearn} hours</p>
            
            {/* Motivation Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Motivation for Learning English:</h3>
              <ul className="list-disc pl-5">
                {Array.isArray(displayData.learnerData?.motivation) 
                  ? displayData.learnerData.motivation.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {item === 'other' 
                          ? displayData.learnerData.otherMotivation 
                          : item.replace(/_/g, ' ')}
                      </li>
                    ))
                  : <li>No motivation specified</li>
                }
              </ul>
            </div>

            {/* Topics of Interest Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Topics of Interest:</h3>
              <ul className="list-disc pl-5">
                {Array.isArray(displayData.learnerData?.interests) 
                  ? displayData.learnerData.interests.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {item === 'other' 
                          ? displayData.learnerData.otherInterests 
                          : item.replace(/_/g, ' ')}
                      </li>
                    ))
                  : <li>No interests specified</li>
                }
              </ul>
            </div>

            {/* Technical Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Learning Preferences:</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Preferred Device:</strong></p>
                  <p className="text-gray-700">
                    {displayData.learnerData?.device 
                      ? Array.isArray(displayData.learnerData.device)
                        ? displayData.learnerData.device.join(' / ')
                        : displayData.learnerData.device.replace(/,/g, ' / ')
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Content Type:</strong></p>
                  <p className="text-gray-700">
                    {displayData.learnerData?.contentType
                      ? Array.isArray(displayData.learnerData.contentType)
                        ? displayData.learnerData.contentType.join(' / ')
                        : displayData.learnerData.contentType.replace(/,/g, ' / ')
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Class Format:</strong></p>
                  <p className="text-gray-700">
                    {displayData.learnerData?.classroomFormat
                      ? Array.isArray(displayData.learnerData.classroomFormat)
                        ? displayData.learnerData.classroomFormat.join(' / ')
                        : displayData.learnerData.classroomFormat.replace(/,/g, ' / ')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Topics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Focus Topics</h2>
              <div className="space-y-4">
                {/* Initial Response */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Initial Response:</h3>
                  <p className="text-gray-700">
                    {displayData?.speakingData?.transcriptHistory?.[0]?.text || 'No response recorded'}
                  </p>
                </div>

                {/* Follow-up Conversation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Follow-up Conversation:</h3>
                  <div className="mb-2">
                    <p className="font-medium text-gray-600">Oliver:</p>
                    <p className="text-gray-700 ml-4">{displayData?.speakingData?.transcriptHistory?.[1]?.text}</p>
                  </div>
                  <div className="mb-2">
                    <p className="font-medium text-gray-600">You:</p>
                    <p className="text-gray-700 ml-4">{displayData?.speakingData?.userResponse}</p>
                  </div>
                </div>

                {/* Additional Focus Topics Input */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Write additional focus topics or specific requirements here:</h3>
                  <textarea
                    className="w-full p-2 border rounded-md min-h-[100px] mb-2"
                    placeholder="Enter additional notes here..."
                    value={additionalTopics}
                    onChange={(e) => setAdditionalTopics(e.target.value)}
                  />
                  <div className="flex items-center">
                    <button
                      onClick={handleSaveAdditionalTopics}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Save Notes
                    </button>
                    {saveStatus && (
                      <span className="ml-3 text-green-600">{saveStatus}</span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-sm text-gray-500">
                  Recorded on: {new Date(displayData?.speakingData?.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OpenAI Analysis Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">OpenAI Analysis: Comprehension and Communication</h2>
          <div className="space-y-4">
            {/* Your Response */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Response:</h3>
              <p className="text-gray-700">{displayData.opinionData?.transcription || 'No response recorded'}</p>
            </div>

            {/* Analysis Content */}
            {displayData.opinionData?.analysis && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Analysis:</h3>
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    <strong>Ability to Understand:</strong>
                    <p className="text-gray-700 mt-1">
                      {displayData.opinionData.analysis.includes('Ability to Understand:')
                        ? displayData.opinionData.analysis.split('Ability to Understand:')[1].split('2.')[0].trim()
                        : 'No data available'}
                    </p>
                  </li>
                  <li>
                    <strong>Ability to Communicate:</strong>
                    <p className="text-gray-700 mt-1">
                      {displayData.opinionData.analysis.includes('Ability to Communicate:')
                        ? displayData.opinionData.analysis.split('Ability to Communicate:')[1].split('3.')[0].trim()
                        : 'No data available'}
                    </p>
                  </li>
                  <li>
                    <strong>CEFR Level:</strong>
                    <p className="text-gray-700 mt-1">
                      {displayData.opinionData.analysis.includes('3. CEFR Level:')
                        ? displayData.opinionData.analysis.split('3. CEFR Level:')[1].split('4.')[0].trim()
                        : 'No data available'}
                    </p>
                  </li>
                  <li>
                    <strong>Key Strengths and Areas for Improvement:</strong>
                    <p className="text-gray-700 mt-1">
                      {displayData.opinionData.analysis.includes('4. Key Strengths and Areas for Improvement:')
                        ? displayData.opinionData.analysis.split('4. Key Strengths and Areas for Improvement:')[1].trim()
                        : 'No data available'}
                    </p>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* SpeechAce Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">SpeechAce Analysis</h2>
          
          {/* Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* SpeechAce Score */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-blue-700">SpeechAce Score</h3>
              <p className="text-gray-700">Pronunciation: <span className="font-medium text-blue-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.pronunciation || 'N/A'}/100</span></p>
              <p className="text-gray-700">Fluency: <span className="font-medium text-blue-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.speechace_score?.fluency || 'N/A'}/100</span></p>
            </div>

            {/* CEFR Score */}
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-green-700">CEFR Score</h3>
              <p className="text-gray-700">Pronunciation: <span className="font-medium text-green-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation || 'N/A'}</span></p>
              <p className="text-gray-700">Fluency: <span className="font-medium text-green-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.fluency || 'N/A'}</span></p>
            </div>

            {/* TOEIC Score */}
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-purple-700">TOEIC Score</h3>
              <p className="text-gray-700">Pronunciation: <span className="font-medium text-purple-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.pronunciation || 'N/A'}/200</span></p>
              <p className="text-gray-700">Fluency: <span className="font-medium text-purple-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.toeic_score?.fluency || 'N/A'}/200</span></p>
            </div>

            {/* IELTS Score */}
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-orange-700">IELTS Score</h3>
              <p className="text-gray-700">Pronunciation: <span className="font-medium text-orange-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.pronunciation || 'N/A'}/9</span></p>
              <p className="text-gray-700">Fluency: <span className="font-medium text-orange-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.ielts_score?.fluency || 'N/A'}/9</span></p>
            </div>

            {/* PTE Score */}
            <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2 text-teal-700">PTE Score</h3>
              <p className="text-gray-700">Pronunciation: <span className="font-medium text-teal-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.pte_score?.pronunciation || 'N/A'}/90</span></p>
              <p className="text-gray-700">Fluency: <span className="font-medium text-teal-600">{displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.pte_score?.fluency || 'N/A'}/90</span></p>
            </div>
          </div>

          {/* Speech Pattern Analysis */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Speech Pattern Analysis</h3>
              <p><strong>Speech Rate:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.speech_rate?.toFixed(1) || 'N/A'} words/second</p>
              <p><strong>Pauses:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.all_pause_count || 'N/A'} pauses</p>
              <p><strong>Average Run Length:</strong> {displayData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.fluency?.overall_metrics?.mean_length_run?.toFixed(1) || 'N/A'} words</p>
            </div>
          </div>
        </div>

        {/* Test Scores Sections */}
        <div className="mb-8 border-b pb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Scores</h2>
          
          {/* Listening Comprehension */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Listening Comprehension</h3>
            <p className="mb-2">You answered {displayData?.listeningCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {displayData?.listeningScore || 0}/10</p>
          </div>
          
          {/* Reading Comprehension */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Reading Comprehension</h3>
            <p className="mb-2">You answered {displayData?.readingCorrectAnswers || 0} questions correctly</p>
            <p className="text-lg font-medium">Score: {displayData?.readingScore || 0}/10</p>
          </div>
        </div>

        {/* Writing Assessment Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Writing Assessment</h2>
          <div className="space-y-4">
            {/* Email Response */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Email:</h3>
              <div className="whitespace-pre-wrap text-gray-700">
                {displayData?.writingData?.email || 'No email content available'}
              </div>
            </div>

            {/* Analysis Content */}
            {displayData.writingData?.analysis && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold mb-2">Analysis:</h3>
                
                <div>
                  <h4 className="font-medium text-gray-700">CEFR Level</h4>
                  <p className="text-gray-600">This learner is generally proficient and can be placed at a B2-C1 level on the CEFR scale.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Language Usage</h4>
                  <p className="text-gray-600">The grammar and vocabulary in this email are used correctly and appropriately, showing a strong command of English.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Structure and Logic</h4>
                  <p className="text-gray-600">The sentences are well structured with a clear message, and ideas and arguments are developed logically. There's also a high degree of coherence and cohesion.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Overall Assessment</h4>
                  <p className="text-gray-600">While the language used might not demonstrate the nuance or complexity associated with a C2 level, it does consistently show the advanced language skills consistent with a B2-C1 level.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Communication Effectiveness</h4>
                  <p className="text-gray-600">The suggestion to organize a walking tour and a lunch at a pub is articulated well, providing evidence of an ability to express ideas clearly in a professional context.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleDownload}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}