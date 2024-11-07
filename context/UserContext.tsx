import { createContext } from 'react';

interface UserData {
  opinionData?: {
    transcription: string;
    timestamp: string;
  };
}

interface UserContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

export const UserContext = createContext<UserContextType>({
  userData: {},
  setUserData: () => {},
});