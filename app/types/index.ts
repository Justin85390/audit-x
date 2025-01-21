export interface UserData {
  contactDetails: {
    name: string;
    email: string;
    assessmentDate: string;
  };
  speakingData: {
    difficulties_transcript: string;
    opinion_transcript: string;
    openai_analysis: string;
    speechace_analysis: {
      pronunciation: string;
      fluency: string;
      vocabulary: string;
      grammar: string;
    };
    speechaceScores?: SpeechaceScores;
    cefrLevel: string;
    cefrDetails: string;
  };
  listeningData: {
    score: number;
    cefrLevel: string;
    cefrDetails: string;
    assessmentDetails: {
      comprehension: string;
      noteDetail: string;
    };
  };
  readingData: {
    score: number;
    cefrLevel: string;
    cefrDetails: string;
    comprehensionDetails: string;
  };
  writingData: {
    submission: string;
    analysis: string;
    cefrLevel: string;
    cefrDetails: string;
  };
  preferencesData: {
    timeCommitment: string;
    motivation: string[];
    interests: string[];
    devicePreferences: string[];
    contentPreferences: string[];
    classroomFormat: string[];
    needsAnalysis: string;
  };
}

export interface SpeechaceScores {
  raw: {
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    overall: number;
  };
  normalized: {
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    overall: number;
  };
  cefr: {
    level: string;
    description: string;
  };
  metadata: {
    scoringVersion: string;
    scoringDate: string;
    scoringMethod: string;
  };
  technicalDetails: {
    wordScores: Array<{
      word: string;
      qualityScore: number;
      phoneticDetails?: any;
    }>;
    pausePatterns?: Array<{
      duration: number;
      position: number;
    }>;
    speechRate?: number;
  };
} 