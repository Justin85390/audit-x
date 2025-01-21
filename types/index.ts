export type Language = 'en' | 'fr';

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
    speechace_analysis: any;
    speechaceScores?: SpeechaceScores;
    cefrLevel: string;
    cefrDetails: string;
  };
  listeningScore: number;
  readingScore: number;
  writingData: {
    submission: string;
    analysis: string;
  };
}

export type UpdateUserDataFunction = (key: string, value: any) => void;

export interface LanguageContent {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  timeCommitment: {
    question: string;
    placeholder: string;
    options: {
      lessThan2: string;
      twoToFour: string;
      fourToSix: string;
      moreThanSix: string;
    };
  };
  motivation: {
    question: string;
    placeholder: string;
    options: {
      work: string;
      academic: string;
      travel: string;
      personal: string;
      other: string;
    };
  };
  interests: {
    question: string;
    placeholder: string;
    options: {
      business: string;
      culture: string;
      science: string;
      currentEvents: string;
      other: string;
    };
  };
  privacyNotice: string;
  submitButton: string;
  videoButton: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  timeCommitment: string;
  motivation: string[];
  interests: string[];
}

export interface TranscriptItem {
  speaker: 'user' | 'oliver';
  text: string;
  timestamp: string;
  language: Language;
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