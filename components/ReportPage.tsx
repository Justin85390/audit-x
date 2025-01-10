'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReportPageProps {
  userData: {
    contactDetails: {
      firstName: string;
      lastName: string;
      email: string;
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
    needsAnalysis?: string[];
  };
  onNext: () => void;
}

export default function ReportPage({ userData, onNext }: ReportPageProps) {
  const router = useRouter();
  const [displayData, setDisplayData] = useState<typeof userData | null>(null);

  useEffect(() => {
    try {
      // Safely load and combine data
      const contactDetails = JSON.parse(localStorage.getItem('contactDetails') || '{}');
      const learnerPreferences = JSON.parse(localStorage.getItem('learnerPreferences') || '{}');
      const technicalPreferences = JSON.parse(localStorage.getItem('technicalPreferences') || '{}');

      // We should also load:
      const speakingData = JSON.parse(localStorage.getItem('speakingData') || '{}');
      const opinionData = JSON.parse(localStorage.getItem('opinionData') || '{}');
      const needsAnalysis = JSON.parse(localStorage.getItem('needsAnalysis') || '[]');

      // Ensure userData exists and has required properties
      const safeUserData = {
        ...userData,
        contactDetails: userData?.contactDetails || {},
        learnerData: userData?.learnerData || {},
        writingData: userData?.writingData || { email: '', analysis: '' },
        speakingData: userData?.speakingData || speakingData || {},
        opinionData: userData?.opinionData || opinionData || {},
        needsAnalysis: userData?.needsAnalysis || needsAnalysis || []
      };

      // Combine the data
      const combinedData = {
        ...safeUserData,
        contactDetails: Object.keys(contactDetails).length > 0 ? contactDetails : safeUserData.contactDetails,
        learnerData: {
          ...safeUserData.learnerData,
          ...learnerPreferences,
          ...technicalPreferences
        }
      };

      console.log('Combined Report Data:', combinedData);
      setDisplayData(combinedData);
    } catch (error) {
      console.error('Error initializing report data:', error);
      setDisplayData(userData);
    }
  }, [userData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      // Save data to localStorage
      localStorage.setItem('reportData', JSON.stringify(displayData));
      console.log('Saved data:', displayData);
      
      // Remove the dashboard redirect
      // router.push('/dashboard');  <- Remove this line
      
      // Instead, you might want to:
      onNext(); // If you want to trigger the next step
      // Or show a completion message
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!displayData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Language Assessment Report</h1>
      
      {/* Display the report sections */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Speaking Section */}
        {displayData.speakingData?.transcript && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Speaking Assessment</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Your Transcript:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{displayData.speakingData.transcript}</p>
              
              {/* SpeechAce Analysis */}
              {displayData.speakingData.speechAceAnalysis && (
                <div className="mt-4">
                  <h3 className="text-xl font-medium">Pronunciation Analysis:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{displayData.speakingData.speechAceAnalysis}</p>
                </div>
              )}

              {/* OpenAI Analysis */}
              {displayData.speakingData.openAIAnalysis && (
                <div className="mt-4">
                  <h3 className="text-xl font-medium">Speaking Skills Analysis:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{displayData.speakingData.openAIAnalysis}</p>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Opinion Section */}
        {displayData.opinionData?.transcript && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Opinion Task Assessment</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Your Response:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{displayData.opinionData.transcript}</p>
              
              {/* OpenAI Analysis for Opinion */}
              {displayData.opinionData.analysis && (
                <div className="mt-4">
                  <h3 className="text-xl font-medium">Analysis:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{displayData.opinionData.analysis}</p>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* Needs Analysis Section */}
        {displayData.needsAnalysis && displayData.needsAnalysis.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Learning Needs Analysis</h2>
            <ul className="list-disc pl-6 space-y-2">
              {displayData.needsAnalysis.map((need, index) => (
                <li key={index} className="text-gray-700">{need}</li>
              ))}
            </ul>
          </section>
        )}
        
        {/* Add your report sections here */}
        
        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save & Continue to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}