'use client';

import { useRouter } from 'next/navigation';

interface ReportPageProps {
  userData: any;
  onNext: () => void;
}

export default function ReportPage({ userData, onNext }: ReportPageProps) {
  console.log('ReportPage userData:', userData);
  console.log('OpinionData:', JSON.stringify(userData?.opinionData, null, 2));
  const videoId = "kW2NUYoTmEY";

  const router = useRouter();

  const handleDownload = () => {
    // Add download functionality here
    console.log('Downloading report...');
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
              <p><strong>Name:</strong> {userData.contactDetails.firstName} {userData.contactDetails.lastName}</p>
              <p><strong>Email:</strong> {userData.contactDetails.email}</p>
              <p><strong>Phone:</strong> {userData.contactDetails.phoneNumber}</p>
            </div>
          </div>

          {/* Learner Data Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Learning Profile</h2>
            <div className="space-y-2">
              <p><strong>Time Available:</strong> {userData.learnerData.timeToLearn}</p>
              <p><strong>Motivation:</strong> {userData.learnerData.motivation}</p>
              <p><strong>Interests:</strong> {userData.learnerData.interests}</p>
            </div>
          </div>

          {/* Difficulties to focus on Section (formerly Speaking Assessment) */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Difficulties to focus on</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Response:</h3>
                <p className="bg-gray-50 p-4 rounded">{userData.speakingData.transcription}</p>
              </div>
            </div>
          </div>

          {/* Opinion Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Expressing an Opinion</h2>
            
            {userData?.opinionData?.transcription ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Your Response:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {userData.opinionData.transcription}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Analysis:</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {userData.opinionData.analysis || 'Analysis pending...'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No opinion recorded</p>
            )}
          </div>

          {/* Listening Comprehension Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Listening Comprehension</h2>
            <p className="mb-2">You answered {userData.listeningCorrectAnswers} questions correctly</p>
            <p className="text-lg font-medium">Score: {userData.listeningScore}/10</p>
          </div>

          {/* Reading Comprehension Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-semibold mb-4">Reading Comprehension</h2>
            <p className="mb-2">You answered {userData.readingCorrectAnswers} questions correctly</p>
            <p className="text-lg font-medium">Score: {userData.readingScore}/10</p>
          </div>

          {/* Writing Assessment Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Writing Assessment</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Email:</h3>
                <p className="bg-gray-50 p-4 rounded whitespace-pre-wrap">{userData.writingData.email}</p>
              </div>
              {userData.writingData.analysis && (
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

        <div className="flex justify-center mb-8">
          <button
            onClick={onNext}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px]"
          >
            Personal Learning Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}