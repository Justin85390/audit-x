export type Language = 'en' | 'fr';

export interface UserData {
  contactDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    age?: string;
    company?: string;
    jobTitle?: string;
    address?: string;
  };
  learnerData?: {
    timeToLearn: string;
    motivation: string;
    interests: string;
    device: string;
    contentType: string;
    classroomFormat: string;
  };
  speakingData?: {
    transcription: string;
  };
  opinionData?: {
    transcription: string;
    analysis: string;
  };
  listeningScore?: number;
  readingScore?: number;
  writingData?: {
    email: string;
  };
  needsAnalysis?: string[];
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