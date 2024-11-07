import { createContext } from 'react';

interface UserData {
  speakingData?: {
    transcription: string;
    timestamp: string;
  };
}

interface UserDataContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export const UserDataContext = createContext<UserDataContextType>({
  userData: {},
  setUserData: () => {},
});