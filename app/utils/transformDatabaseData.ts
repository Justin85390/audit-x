import { UserData } from '@/app/types';
import { calculateScores, mapScoreToCEFR } from './speechaceScoring';

interface DatabaseUser {
  // Basic user info
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  
  // Speaking assessment
  speaking_difficulties_transcript: string;
  speaking_opinion_transcript: string;
  speaking_openai_analysis: string;
  speaking_speechace_analysis: string; // This is JSON stored as string
  
  // Listening assessment
  listening_score: number;
  
  // Reading assessment
  reading_score: number;
  
  // Writing assessment
  writing_submission: string;
  writing_openai_analysis: string;
  
  // Preferences
  time_commitment: string;
  motivation: string;
  interests: string;
  device_preferences: string;
  content_type_preferences: string;
  classroom_format: string;
  needs_analysis: string;
  
  // Optional fields
  topics: string | null;
}

export function transformDatabaseData(dbData: DatabaseUser): UserData {
  // Updated helper function to handle various data types
  const safeSplit = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim());
    return [String(value)];
  };

  console.log('Raw data before transform:', dbData); // Debug log

  // Add logging to see raw speechace data
  console.log('Raw speechace data:', dbData.speaking_speechace_analysis);

  // Helper function to safely parse speechace data
  const parseSpeechaceAnalysis = (data: string | null) => {
    console.log('Starting speechace analysis with data:', data); // Log 1

    try {
      if (!data) {
        console.log('No speechace data found, returning defaults'); // Log 2
        return {
          pronunciation: '0',
          fluency: '0',
          vocabulary: '0',
          grammar: '0'
        };
      }

      // Log the data before parsing
      console.log('About to parse speechace data:', data); // Log 3
      
      const parsed = JSON.parse(data);
      console.log('Successfully parsed speechace data:', parsed); // Log 4
      console.log('Analysis object:', parsed.analysis); // Log 5

      // Extract and log each score
      const scores = {
        pronunciation: parsed.analysis?.pronunciation_score || '0',
        fluency: parsed.analysis?.fluency_score || '0',
        vocabulary: parsed.analysis?.vocabulary_score || '0',
        grammar: parsed.analysis?.grammar_score || '0'
      };
      
      console.log('Extracted scores:', scores); // Log 6
      return scores;

    } catch (e) {
      console.error('Error parsing speechace data:', e); // Log 7
      console.error('Problematic data:', data); // Log 8
      return {
        pronunciation: '0',
        fluency: '0',
        vocabulary: '0',
        grammar: '0'
      };
    }
  };

  const speechaceData = dbData.speaking_speechace_analysis 
    ? JSON.parse(dbData.speaking_speechace_analysis)
    : null;

  const scores = speechaceData?.analysis ? {
    pronunciation: Number(speechaceData.analysis.pronunciation_score),
    fluency: Number(speechaceData.analysis.fluency_score),
    vocabulary: Number(speechaceData.analysis.vocabulary_score),
    grammar: Number(speechaceData.analysis.grammar_score)
  } : null;

  console.log('Calculated scores:', scores); // Add this

  const cefrResult = scores ? mapScoreToCEFR(scores) : { level: 'B1', description: 'Default' };
  console.log('CEFR Result:', cefrResult); // Add this

  return {
    contactDetails: {
      name: `${dbData.first_name || ''} ${dbData.last_name || ''}`.trim(),
      email: dbData.email || '',
      assessmentDate: dbData.created_at || new Date().toISOString()
    },
    speakingData: {
      difficulties_transcript: dbData.speaking_difficulties_transcript || '',
      opinion_transcript: dbData.speaking_opinion_transcript || '',
      openai_analysis: dbData.speaking_openai_analysis || '',
      speechace_analysis: parseSpeechaceAnalysis(dbData.speaking_speechace_analysis),
      cefrLevel: cefrResult.level,
      cefrDetails: cefrResult.description,
      speechaceScores: speechaceData ? calculateScores(speechaceData) : undefined
    },
    listeningData: {
      score: Number(dbData.listening_score) || 0,
      cefrLevel: "B2",
      cefrDetails: "Can understand the main ideas of complex speech on concrete and abstract topics.",
      assessmentDetails: {
        comprehension: "Good understanding of main points",
        noteDetail: "Captured key information accurately"
      }
    },
    readingData: {
      score: Number(dbData.reading_score) || 0,
      cefrLevel: "B2",
      cefrDetails: "Can read with a large degree of independence.",
      comprehensionDetails: "Good comprehension of main points"
    },
    writingData: {
      submission: dbData.writing_submission || '',
      analysis: dbData.writing_openai_analysis || '',
      cefrLevel: "B2",
      cefrDetails: "Can write clear, detailed text on a wide range of subjects."
    },
    preferencesData: {
      timeCommitment: dbData.time_commitment || '',
      motivation: safeSplit(dbData.motivation),
      interests: safeSplit(dbData.interests),
      devicePreferences: safeSplit(dbData.device_preferences),
      contentPreferences: safeSplit(dbData.content_type_preferences),
      classroomFormat: safeSplit(dbData.classroom_format),
      needsAnalysis: dbData.needs_analysis || ''
    }
  };
} 