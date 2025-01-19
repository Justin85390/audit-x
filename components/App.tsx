import { useState } from 'react'
import WelcomePage from './WelcomePage'
import ContactDetailsPage from './ContactDetailsPage'
import LearnerDataPage from './LearnerDataPage'
import SpeakingPage from './SpeakingPage'
import OpinionPage from './OpinionPage'
import ListeningComprehensionPage from './ListeningComprehensionPage'
import ReadingComprehensionPage from './ReadingComprehensionPage'
import WritingPage from './WritingPage'
import ReportPage from './ReportPage'
import NeedsAnalysisPage from './NeedsAnalysisPage'

// Define more specific interfaces for your data
interface ContactDetails {
  name?: string;
  email?: string;
  phone?: string;
}

interface LearnerData {
  level?: string;
  goals?: string[];
  availability?: string;
}

// Define the correct interface for UserData
interface UserData {
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

// Type for the update function
type UpdateUserDataFunction = (key: keyof UserData, value: UserData[keyof UserData]) => void;

interface PageProps {
  onNext: () => void;
  updateUserData: UpdateUserDataFunction;
}

interface ReportPageProps {
  userData: UserData;
  onNext: () => void;
  updateUserData: UpdateUserDataFunction;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [userData, setUserData] = useState<UserData>({
    contactDetails: {
      name: '',
      email: ''
    },
    learnerData: {
      timeToLearn: '',
      motivation: [],
      interests: [],
      device: [],
      contentType: [],
      classroomFormat: []
    },
    speakingData: {
      transcripts: [],
      timestamp: ''
    },
    opinionData: {
      transcription: '',
      analysis: '',
      speechAceAnalysis: null,
      timestamp: ''
    },
    listeningScore: 0,
    readingScore: 0,
    writingScore: 0
  })

  const nextPage = () => setCurrentPage((prev) => prev + 1)
  
  const updateUserData: UpdateUserDataFunction = (key, value) => {
    setUserData((prev) => ({ ...prev, [key]: value }))
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <WelcomePage onNext={nextPage} />
      case 2:
        return <ContactDetailsPage onNext={nextPage} updateUserData={updateUserData} />
      case 3:
        return <NeedsAnalysisPage onNext={nextPage} updateUserData={updateUserData} />
      case 4:
        return <LearnerDataPage onNext={nextPage} updateUserData={updateUserData} />
      case 5:
        return <SpeakingPage onNext={nextPage} updateUserData={updateUserData} />
      case 6:
        return <OpinionPage onNext={nextPage} updateUserData={updateUserData} />
      case 7:
        return <ListeningComprehensionPage onNext={nextPage} updateUserData={updateUserData} />
      case 8:
        return <ReadingComprehensionPage onNext={nextPage} updateUserData={updateUserData} />
      case 9:
        return <WritingPage onNext={nextPage} updateUserData={updateUserData} />
      case 10:
        return <ReportPage 
          onNext={nextPage}
          updateUserData={updateUserData}
        />
      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  )
}