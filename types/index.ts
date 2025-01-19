export type Language = 'en' | 'fr';

export interface UserData {
  contactDetails: {
    name: string;
    email: string;
  };
  learnerData: {
    timeToLearn: string;
    motivation: string[];
    interests: string[];
    device: string[];
    contentType: string[];
    classroomFormat: string[];
  };
  speakingData: {
    transcripts: Array<{
      text: string;
      timestamp: string;
    }>;
    timestamp: string;
  };
  opinionData: {
    transcription: string;
    analysis: string;
    speechAceAnalysis: any;
    timestamp: string;
  };
  listeningScore: number;
  readingScore: number;
  writingScore: number;
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