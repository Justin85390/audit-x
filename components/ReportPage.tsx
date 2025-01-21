'use client';

import { useState, useRef, useEffect } from 'react';
import { UserData } from '@/app/types';
import { useLanguage } from '../app/contexts/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import { transformDatabaseData } from '@/app/utils/transformDatabaseData';

interface ReportPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  userData?: UserData;  // Make userData optional since we'll fetch it
}

const CEFR_LEVELS = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 6
};

const CEFR_NUMERICAL_TO_LEVEL = {
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'C1',
  6: 'C2'
};

const CEFR_DESCRIPTIONS = {
  'A1': 'Basic user - Breakthrough or beginner',
  'A2': 'Basic user - Waystage or elementary',
  'B1': 'Independent user - Threshold or intermediate',
  'B2': 'Independent user - Vantage or upper intermediate',
  'C1': 'Proficient user - Effective operational proficiency',
  'C2': 'Proficient user - Mastery or proficiency'
};

// Add the CEFR calculation function
const getCefrLevel = (score: number): string => {
  if (score >= 90) return 'C1-C2';
  if (score >= 70) return 'B2';
  if (score >= 50) return 'B1';
  if (score >= 30) return 'A2';
  return 'A1';
};

// Add CEFR descriptions
const cefrDescriptions = {
  'C1-C2': 'Can understand virtually any kind of spoken language, including complex topics.',
  'B2': 'Can understand the main ideas of complex speech on concrete and abstract topics.',
  'B1': 'Can understand the main points of clear standard speech on familiar matters.',
  'A2': 'Can understand phrases and common vocabulary related to basic personal and family information.',
  'A1': 'Can recognize familiar words and very basic phrases concerning immediate concrete surroundings.'
};

// Add more detailed CEFR listening descriptions
const listeningCefrDescriptions = {
  'C1-C2': {
    level: 'Advanced/Mastery',
    description: 'Can understand any kind of spoken language, including complex academic and professional discussions. Can follow complex arguments even when not clearly structured.',
    examples: 'Can understand complex technical discussions, rapid native speech, and subtle cultural references.',
    recommendations: 'Practice with academic lectures, complex documentaries, and native-speed debates.'
  },
  'B2': {
    level: 'Upper Intermediate',
    description: 'Can understand the main ideas of complex speech on both concrete and abstract topics, including technical discussions.',
    examples: 'Can follow extended speech and complex lines of argument on familiar topics.',
    recommendations: 'Focus on news broadcasts, technical presentations, and academic lectures.'
  },
  'B1': {
    level: 'Intermediate',
    description: 'Can understand the main points of clear standard speech on familiar matters regularly encountered in work, school, and leisure.',
    examples: 'Can follow straightforward short talks on familiar topics.',
    recommendations: 'Practice with podcasts, short presentations, and clear dialogues on familiar topics.'
  },
  'A2': {
    level: 'Elementary',
    description: 'Can understand phrases and common vocabulary related to areas of immediate personal relevance.',
    examples: 'Can catch the main point in short, clear, simple messages and announcements.',
    recommendations: 'Focus on basic conversations, simple announcements, and short audio clips with clear speech.'
  },
  'A1': {
    level: 'Beginner',
    description: 'Can recognize familiar words and very basic phrases concerning immediate concrete surroundings.',
    examples: 'Can understand simple greetings and basic instructions when spoken slowly.',
    recommendations: 'Start with basic listening exercises, simple commands, and numbers/dates practice.'
  }
};

// Add detailed CEFR reading descriptions
const readingCefrDescriptions = {
  'C1-C2': {
    level: 'Advanced/Mastery',
    description: 'Can understand virtually all forms of written text, including abstract, structurally complex, or highly colloquial literary and non-literary writings.',
    examples: 'Can understand complex academic papers, legal documents, and literary works with subtle nuances.',
    recommendations: 'Challenge yourself with academic journals, complex literature, and technical documentation.'
  },
  'B2': {
    level: 'Upper Intermediate',
    description: 'Can read with a high degree of independence, adapting style and speed of reading to different texts and purposes.',
    examples: 'Can understand specialized articles, longer technical instructions, and newspaper editorials.',
    recommendations: 'Focus on reading news analysis, technical articles, and contemporary literature.'
  },
  'B1': {
    level: 'Intermediate',
    description: 'Can understand texts that consist mainly of high frequency, everyday or job-related language.',
    examples: 'Can understand routine information and articles, and the general meaning of non-routine information.',
    recommendations: 'Practice with magazine articles, simple news stories, and straightforward instructions.'
  },
  'A2': {
    level: 'Elementary',
    description: 'Can understand short, simple texts containing high frequency vocabulary and shared international expressions.',
    examples: 'Can understand basic notices, instructions, and information in familiar contexts.',
    recommendations: 'Read short articles, simple stories, and basic instructions with familiar vocabulary.'
  },
  'A1': {
    level: 'Beginner',
    description: 'Can understand very short, simple texts, one phrase at a time, picking up familiar names, words, and basic phrases.',
    examples: 'Can understand simple forms, signs, and short personal messages.',
    recommendations: 'Start with simple texts, basic signs, and short messages using familiar words.'
  }
};

export default function ReportPage({ onNext, updateUserData }: ReportPageProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  
  // Add toggle states
  const [speakingExpanded, setSpeakingExpanded] = useState(false);
  const [listeningExpanded, setListeningExpanded] = useState(false);
  const [readingExpanded, setReadingExpanded] = useState(false);
  const [writingExpanded, setWritingExpanded] = useState(false);
  const [overallExpanded, setOverallExpanded] = useState(false);

  // Add the data fetching logic
  useEffect(() => {
    async function fetchUserData() {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          speaking_speechace_analysis,
          speaking_opinion_transcript,
          speaking_openai_analysis,
          listening_score,
          reading_score,
          writing_submission,
          writing_openai_analysis
        `)
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data) {
        const transformedData = transformDatabaseData(data);
        setUserData(transformedData);
      }
    }

    fetchUserData();
  }, []);

  function calculateOverallCEFR(userData: UserData | undefined): string {
    if (!userData) return 'N/A';
    
    const levels = {
      'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'C1-C2': 5.5
    };

    // Get CEFR levels using the appropriate method for each skill
    const speakingLevel = userData.speakingData?.cefrLevel || 'B1';
    const listeningLevel = getCefrLevel(userData.listeningData?.score || 0);
    const readingLevel = getCefrLevel(userData.readingData?.score || 0);
    const writingLevel = userData.writingData?.cefrLevel || 'B1';

    // Calculate average level
    const avgLevel = (
      levels[speakingLevel] +
      levels[listeningLevel] +
      levels[readingLevel] +
      levels[writingLevel]
    ) / 4;

    // Map back to CEFR
    if (avgLevel >= 5.5) return 'C2';
    if (avgLevel >= 4.5) return 'C1';
    if (avgLevel >= 3.5) return 'B2';
    if (avgLevel >= 2.5) return 'B1';
    if (avgLevel >= 1.5) return 'A2';
    return 'A1';
  }

  function generateRecommendations(userData: UserData | undefined): string[] {
    if (!userData) return [];

    const recommendations: string[] = [];

    // Add recommendations based on CEFR levels and scores
    const listeningLevel = getCefrLevel(userData?.listeningData?.score || 0);
    const readingLevel = getCefrLevel(userData?.readingData?.score || 0);
    const speakingLevel = userData?.speakingData?.cefrLevel;
    const writingLevel = userData?.writingData?.cefrLevel;

    // Add skill-specific recommendations
    if (listeningLevel) {
      recommendations.push(listeningCefrDescriptions[listeningLevel].recommendations);
    }

    if (readingLevel) {
      recommendations.push(readingCefrDescriptions[readingLevel].recommendations);
    }

    // Add speaking recommendations based on SpeechAce scores
    const speechScores = userData?.speakingData?.speechace_analysis;
    if (speechScores) {
      if (Number(speechScores.pronunciation) < 90) {
        recommendations.push('Practice pronunciation with focused exercises and speech recognition tools');
      }
      if (Number(speechScores.fluency) < 90) {
        recommendations.push('Improve fluency through regular conversation practice and speaking exercises');
      }
    }

    return recommendations;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Section */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          {language === 'en' ? 'Your Audit Report' : 'Votre Rapport d\'Audit'}
        </h1>

        <video
          ref={videoRef}
          src={language === 'en' 
            ? "https://justindonlon.com/wp-content/uploads/2024/11/ReportPage.mp4"
            : "https://justindonlon.com/wp-content/uploads/2025/01/FR-ReportPage.mp4"
          }
          playsInline
          autoPlay
          controls
          className="rounded-lg mb-6"
          width="100%"
        />
      </div>

      {/* NEW: User Info Section */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-gray-600 text-sm">Name</h3>
            <p className="font-semibold">{userData?.contactDetails?.name}</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm">Email</h3>
            <p className="font-semibold">{userData?.contactDetails?.email}</p>
          </div>
          <div className="col-span-2">
            <h3 className="text-gray-600 text-sm">Assessment Date</h3>
            <p className="font-semibold">
              {userData?.contactDetails?.assessmentDate ? 
                new Date(userData.contactDetails.assessmentDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
                : 'Not available'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Report Sections Container - Same width as video container */}
      <div className="w-full max-w-3xl space-y-6">
        {/* Section 1: Speaking Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Speaking Assessment</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">CEFR Level: {userData?.speakingData?.cefrLevel}</h3>
              <p className="text-gray-700">
                {userData?.speakingData?.openai_analysis?.split('.')[0]}.
              </p>
              <button
                onClick={() => setSpeakingExpanded(!speakingExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {speakingExpanded ? 'Hide Assessment Details ▼' : 'Show Assessment Details ▶'}
              </button>
            </div>

            {speakingExpanded && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-200">
                <h4 className="font-medium text-gray-700 mb-3">Assessment Details</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700">General Analysis</h5>
                    <p className="text-gray-600">{userData?.speakingData?.openai_analysis}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700">Technical Scores</h5>
                    <div className="space-y-2 mt-2">
                      <div>
                        <span className="font-medium">Pronunciation:</span>
                        <p className="text-gray-600 ml-4">{userData?.speakingData?.speechace_analysis?.pronunciation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Fluency:</span>
                        <p className="text-gray-600 ml-4">{userData?.speakingData?.speechace_analysis?.fluency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Vocabulary:</span>
                        <p className="text-gray-600 ml-4">{userData?.speakingData?.speechace_analysis?.vocabulary}</p>
                      </div>
                      <div>
                        <span className="font-medium">Grammar:</span>
                        <p className="text-gray-600 ml-4">{userData?.speakingData?.speechace_analysis?.grammar}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Listening Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Listening Assessment</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                CEFR Level: {getCefrLevel(userData?.listeningData?.score || 0)}
              </h3>
              <p className="text-gray-700">
                {listeningCefrDescriptions[getCefrLevel(userData?.listeningData?.score || 0)].description}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Score: {userData?.listeningData?.score}%
              </p>
              <button
                onClick={() => setListeningExpanded(!listeningExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {listeningExpanded ? 'Hide Assessment Details ▼' : 'Show Assessment Details ▶'}
              </button>
            </div>

            {listeningExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium">Examples:</h4>
                  <p className="text-sm text-gray-600">
                    {listeningCefrDescriptions[getCefrLevel(userData?.listeningData?.score || 0)].examples}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Recommendations:</h4>
                  <p className="text-sm text-gray-600">
                    {listeningCefrDescriptions[getCefrLevel(userData?.listeningData?.score || 0)].recommendations}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Reading Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Reading Assessment</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                CEFR Level: {getCefrLevel(userData?.readingData?.score || 0)}
              </h3>
              <p className="text-gray-700">
                {readingCefrDescriptions[getCefrLevel(userData?.readingData?.score || 0)].description}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Score: {userData?.readingData?.score}%
              </p>
              <button
                onClick={() => setReadingExpanded(!readingExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {readingExpanded ? 'Hide Assessment Details ▼' : 'Show Assessment Details ▶'}
              </button>
            </div>

            {readingExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium">Examples:</h4>
                  <p className="text-sm text-gray-600">
                    {readingCefrDescriptions[getCefrLevel(userData?.readingData?.score || 0)].examples}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Recommendations:</h4>
                  <p className="text-sm text-gray-600">
                    {readingCefrDescriptions[getCefrLevel(userData?.readingData?.score || 0)].recommendations}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Writing Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Writing Assessment</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">CEFR Level: {userData?.writingData?.cefrLevel}</h3>
              <p className="text-gray-700">
                {userData?.writingData?.analysis?.split('.')[0]}.
              </p>
              <button
                onClick={() => setWritingExpanded(!writingExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {writingExpanded ? 'Hide Assessment Details ▼' : 'Show Assessment Details ▶'}
              </button>
            </div>

            {writingExpanded && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Assessment Details</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700">Email Submission</h5>
                    <p className="text-gray-600 ml-4">{userData?.writingData?.submission}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700">Analysis</h5>
                    <p className="text-gray-600 ml-4">{userData?.writingData?.analysis}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Overall Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Overall Analysis</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">
                Overall CEFR Level: {calculateOverallCEFR(userData)}
              </h3>
              <p className="text-gray-700">
                {CEFR_DESCRIPTIONS[calculateOverallCEFR(userData)]}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Speaking</h4>
                  <p className="text-gray-800">{userData?.speakingData?.cefrLevel || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Listening</h4>
                  <p className="text-gray-800">{getCefrLevel(userData?.listeningData?.score || 0)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Reading</h4>
                  <p className="text-gray-800">{getCefrLevel(userData?.readingData?.score || 0)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Writing</h4>
                  <p className="text-gray-800">{userData?.writingData?.cefrLevel || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW Section: Your Preferences & Needs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Preferences & Needs</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Learning Commitment</h3>
              <p className="text-gray-700">Time Available: {userData?.preferencesData?.timeCommitment}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Motivation & Interests</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-700">Motivation:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {userData?.preferencesData?.motivation.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Areas of Interest:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {userData?.preferencesData?.interests.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Learning Preferences</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-700">Preferred Devices:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {userData?.preferencesData?.devicePreferences.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Content Types:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {userData?.preferencesData?.contentPreferences.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Preferred Learning Format:</h4>
                  <ul className="list-disc list-inside ml-2">
                    {userData?.preferencesData?.classroomFormat.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Needs Analysis Summary</h3>
              <p className="text-gray-700">{userData?.preferencesData?.needsAnalysis}</p>
            </div>
          </div>
        </div>

        {/* NEW Section: Focus Points */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Focus Points</h2>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Learner's Identified Challenges</h3>
            <p className="text-gray-700">{userData?.speakingData?.difficulties_transcript}</p>
          </div>
        </div>

        {/* Section 6: Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {generateRecommendations(userData).map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6 mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
            onClick={() => console.log('Download PDF clicked')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download PDF</span>
          </button>
          
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center space-x-2"
            onClick={() => console.log('Email Report clicked')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Email Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}