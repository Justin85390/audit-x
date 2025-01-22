'use client';

import { useState, useRef, useEffect } from 'react';
import { UserData } from '@/app/types';
import { useLanguage } from '../app/contexts/LanguageContext';
import { supabase } from '@/app/lib/supabase';
import { transformDatabaseData } from '@/app/utils/transformDatabaseData';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';  // For better table formatting

interface AutoTableOptions {
  startY: number;
  head?: any[][];
  body: any[][];
  margin?: { left: number; right?: number };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
  'C2': 6,
  'C1-C2': 5.5
} as const;

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

// Helper function to extract first sentence
const extractFirstSentence = (analysis: string): string => {
  // Skip any leading numbers or bullets
  const cleanText = analysis.replace(/^[0-9]+\.\s*/, '');
  
  // Find the first sentence
  const match = cleanText.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : cleanText;
};

// Add a helper function to format the analysis text
const formatAnalysisText = (analysis: string | undefined): string => {
  if (!analysis) return '';
  
  return analysis
    // Add space before "Detailed Analysis"
    .replace('Detailed Analysis:', '\n\nDetailed Analysis:')
    // Make "Detailed Analysis:" bold
    .replace('Detailed Analysis:', '<strong>Detailed Analysis:</strong>')
    // Add line breaks before each bullet point
    .replace(/- (Pronunciation|Fluency|Vocabulary|Grammar|Communication)/g, '\n- $1');
};

// Format as bullet points with proper type handling
const formatArrayDisplay = (arr?: string | string[]): string => {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  return arr.join(', ');
};

// Move getRecommendations outside of generateRecommendations
function getRecommendations(userData: UserData | undefined): string[] {
  if (!userData) return [];

  const recommendations = [
    // Listening & Reading (existing)
    readingCefrDescriptions[getCefrLevel(userData?.readingData?.score || 0)].recommendations,
    listeningCefrDescriptions[getCefrLevel(userData?.listeningData?.score || 0)].recommendations,
    
    // Add Writing & Speaking based on CEFR levels
    `Practice ${userData?.writingData?.cefrLevel} level writing tasks: emails, reports, and essays`,
    `Focus on ${userData?.speakingData?.cefrLevel} level speaking activities: presentations and discussions`,
  ];

  // Add needs analysis if it exists and is an array
  if (userData.preferencesData?.needsAnalysis) {
    if (Array.isArray(userData.preferencesData.needsAnalysis)) {
      recommendations.push(...userData.preferencesData.needsAnalysis);
    }
  }

  return recommendations.filter(Boolean); // Remove any undefined/null values
}

// Then in generateRecommendations function
function generateRecommendations(userData: UserData | undefined): string[] {
  if (!userData) return [];
  return getRecommendations(userData);
}

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

  // Add loading state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Update the handleDownloadPDF function for better type safety
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    try {
      // Add page border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 190, 277);
      
      // Make logo more square and smaller
      doc.addImage('/Linguaphone-logo.png', 'PNG', 15, 15, 25, 15);  // Reduced width to 25, height to 15
      
      // Center the title
      doc.setFontSize(20);
      const titleText = 'Linguaphone Language Audit Report';
      const titleWidth = doc.getStringUnitWidth(titleText) * doc.getFontSize() / doc.internal.scaleFactor;
      const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
      doc.text(titleText, titleX, 30);
      
      // Add user info
      doc.setFontSize(12);
      doc.text(`Name: ${userData?.contactDetails?.name}`, 15, 50);
      doc.text(`Email: ${userData?.contactDetails?.email}`, 15, 60);
      doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, 15, 70);

      // Make Overall CEFR Level more prominent
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');  // Specify font family
      doc.text('Overall CEFR Level:', 15, 90);
      doc.setFont('helvetica', 'normal'); // Reset to normal
      doc.text(calculateOverallCEFR(userData), 100, 90);

      // Add Speaking Assessment
      doc.setFontSize(16);
      doc.text('Speaking Assessment', 15, 110);
      
      doc.setFontSize(12);
      doc.text(`CEFR Level: ${userData?.speakingData?.cefrLevel}`, 15, 125);

      // Add technical scores in a table first
      (doc as any).autoTable({
        startY: 135,
        head: [['Skill', 'Score']],
        body: [
          ['Pronunciation', userData?.speakingData?.speechace_analysis?.pronunciation],
          ['Fluency', userData?.speakingData?.speechace_analysis?.fluency],
          ['Vocabulary', userData?.speakingData?.speechace_analysis?.vocabulary],
          ['Grammar', userData?.speakingData?.speechace_analysis?.grammar]
        ],
        margin: { left: 15 }
      });

      // Then add speaking analysis
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Speaking Analysis']],
        body: [[
          userData?.speakingData?.openai_analysis || 'No analysis available'
        ]],
        margin: { left: 15 }
      });

      // Force Listening Assessment to start on page 2
      doc.addPage();
      doc.rect(10, 10, 190, 277); // Add border to new page

      // Add Listening Assessment at top of page 2
      doc.setFontSize(16);
      doc.text('Listening Assessment', 15, 30);
      
      doc.setFontSize(12);
      const listeningLevel = getCefrLevel(userData?.listeningData?.score || 0);
      doc.text(`CEFR Level: ${listeningLevel}`, 15, 45);
      doc.text(`Score: ${userData?.listeningData?.score}%`, 15, 55);

      // Add listening description in a table
      (doc as any).autoTable({
        startY: 65,
        head: [['Description', 'Examples', 'Recommendations']],
        body: [[
          listeningCefrDescriptions[listeningLevel].description,
          listeningCefrDescriptions[listeningLevel].examples,
          listeningCefrDescriptions[listeningLevel].recommendations
        ]],
        margin: { left: 15 }
      });

      // Get the final Y position after the listening table
      const listeningFinalY = (doc as any).lastAutoTable.finalY || 85;

      // Add Reading Assessment
      doc.setFontSize(16);
      doc.text('Reading Assessment', 15, listeningFinalY + 20);

      doc.setFontSize(12);
      const readingLevel = getCefrLevel(userData?.readingData?.score || 0);
      doc.text(`CEFR Level: ${readingLevel}`, 15, listeningFinalY + 35);
      doc.text(`Score: ${userData?.readingData?.score}%`, 15, listeningFinalY + 45);

      // Add reading description in a table
      (doc as any).autoTable({
        startY: listeningFinalY + 55,
        head: [['Description', 'Examples', 'Recommendations']],
        body: [[
          readingCefrDescriptions[readingLevel].description,
          readingCefrDescriptions[readingLevel].examples,
          readingCefrDescriptions[readingLevel].recommendations
        ]],
        margin: { left: 15 }
      });

      // Get the final Y position after the reading table
      let readingFinalY = (doc as any).lastAutoTable.finalY || 105;

      // Check if we need a new page
      if (readingFinalY > 650) {
        doc.addPage();
        doc.rect(10, 10, 190, 277); // Add border to new page
        readingFinalY = 20;
      }

      // Add Writing Assessment
      doc.setFontSize(16);
      doc.text('Writing Assessment', 15, readingFinalY + 20);

      doc.setFontSize(12);
      doc.text(`CEFR Level: ${userData?.writingData?.cefrLevel}`, 15, readingFinalY + 35);
      
      // Add writing analysis in a table
      (doc as any).autoTable({
        startY: readingFinalY + 45,
        head: [['Analysis']],
        body: [[
          userData?.writingData?.analysis || 'No analysis available'
        ]],
        margin: { left: 15 }
      });

      // Remove the forced page break for Recommendations and let Writing Assessment flow naturally
      let writingFinalY = (doc as any).lastAutoTable.finalY || 155;

      // If we're on page 2 and near the bottom, let it flow to page 3
      if (writingFinalY > 650) {
        doc.addPage();
        doc.rect(10, 10, 190, 277); // Add border to page 3
        writingFinalY = 20;
      }

      // Add Recommendations after Writing Assessment
      doc.setFontSize(16);
      doc.text('Recommendations', 15, writingFinalY + 20);

      // Add recommendations in a table
      (doc as any).autoTable({
        startY: writingFinalY + 30,
        head: [['Recommendations']],
        body: generateRecommendations(userData).map(rec => [rec]),
        margin: { left: 15, right: 15 }
      });

      // Instead, add this simpler approach
      doc.setPage(3);  // Switch to page 3 (will only work if page 3 exists)
      doc.rect(10, 10, 190, 277); // Add border to page 3

      // Format filename safely
      const userName = userData?.contactDetails?.name?.replace(/[^a-z0-9]/gi, '_') || 'User';
      const fileName = `${userName}_Language_Audit_Report.pdf`;
      
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Add error handling UI if needed
    }
  };

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
              <div className="text-gray-700">
                {userData?.speakingData?.openai_analysis && 
                  extractFirstSentence(userData.speakingData.openai_analysis)
                }
              </div>
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
                    <p className="text-gray-600 whitespace-pre-line" 
                       dangerouslySetInnerHTML={{ 
                         __html: formatAnalysisText(userData?.speakingData?.openai_analysis) 
                       }} 
                    />
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

        {/* Section: Writing Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Writing Assessment</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">CEFR Level: {userData?.writingData?.cefrLevel}</h3>
              <div className="text-gray-700">
                {userData?.writingData?.analysis && 
                  extractFirstSentence(userData.writingData.analysis)
                }
              </div>
              <button
                onClick={() => setWritingExpanded(!writingExpanded)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {writingExpanded ? 'Hide Assessment Details ▼' : 'Show Assessment Details ▶'}
              </button>
            </div>

            {writingExpanded && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-200">
                <h4 className="font-medium text-gray-700 mb-3">Assessment Details</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700">General Analysis</h5>
                    <p className="text-gray-600 whitespace-pre-line" 
                      dangerouslySetInnerHTML={{ 
                        __html: formatAnalysisText(userData?.writingData?.analysis) 
                      }} 
                    />
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
              <p className="text-gray-700">
                {formatArrayDisplay(userData?.preferencesData?.needsAnalysis)}
              </p>
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
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 
                        rounded-lg flex items-center space-x-2 ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={async () => {
              setIsGeneratingPDF(true);
              try {
                await handleDownloadPDF();
              } finally {
                setIsGeneratingPDF(false);
              }
            }}
            disabled={isGeneratingPDF}
          >
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}