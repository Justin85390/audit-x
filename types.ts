export type Language = 'en' | 'fr';

export interface LanguageContent {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  timeCommitment: {
    question: string;
    placeholder: string;
    options: Record<string, string>;
  };
  motivation: {
    question: string;
    placeholder: string;
    options: Record<string, string>;
  };
  interests: {
    question: string;
    placeholder: string;
    options: Record<string, string>;
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

export interface UserData {
  // Add your user data structure here
}

export type UpdateUserDataFunction = (key: string, value: any) => void; 