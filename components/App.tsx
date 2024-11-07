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

export interface UserData {
  contactDetails: Record<string, any>;
  learnerData: Record<string, any>;
  speakingData: {
    transcription: string;
    timestamp: string;
  };
  opinionData: {
    transcription: string;
    analysis: string;
    timestamp: string;
  };
  listeningScore: number;
  listeningCorrectAnswers: number;
  readingScore: number;
  readingCorrectAnswers: number;
  writingData: {
    email: string;
  };
}

interface ReportPageProps {
  userData: UserData;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)
  const [userData, setUserData] = useState({
    contactDetails: {},
    learnerData: {},
    speakingData: {
      transcription: '',
      timestamp: '',
    },
    opinionData: {
      transcription: '',
      analysis: '',
      timestamp: '',
    },
    listeningScore: 0,
    listeningCorrectAnswers: 0,
    readingScore: 0,
    readingCorrectAnswers: 0,
    writingData: {
      email: '',
    },
  })

  const nextPage = () => setCurrentPage((prev) => prev + 1)

  const updateUserData = (key: string, value: any) => {
    setUserData((prev) => ({ ...prev, [key]: value }))
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <WelcomePage onNext={nextPage} />
      case 2:
        return <ContactDetailsPage onNext={nextPage} updateUserData={updateUserData} />
      case 3:
        return <LearnerDataPage onNext={nextPage} updateUserData={updateUserData} />
      case 4:
        return <SpeakingPage onNext={nextPage} updateUserData={updateUserData} />
      case 5:
        return <OpinionPage onNext={nextPage} updateUserData={updateUserData} />
      case 6:
        return <ListeningComprehensionPage onNext={nextPage} updateUserData={updateUserData} />
      case 7:
        return <ReadingComprehensionPage onNext={nextPage} updateUserData={updateUserData} />
      case 8:
        return <WritingPage onNext={nextPage} updateUserData={updateUserData} />
      case 9:
        return <ReportPage userData={userData} />
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