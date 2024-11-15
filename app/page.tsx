"use client";

import { useState, useEffect } from 'react';
import WelcomePage from '../components/WelcomePage';
import ContactDetailsPage from '../components/ContactDetailsPage';
import LearnerDataPage from '../components/LearnerDataPage';
import SpeakingPage from '../components/SpeakingPage';
import OpinionPage from '../components/OpinionPage';
import ListeningComprehensionPage from '../components/ListeningComprehensionPage';
import ReadingComprehensionPage from '../components/ReadingComprehensionPage';
import WritingPage from '../components/WritingPage';
import ReportPage from '@/components/ReportPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userData, setUserData] = useState({
    contactDetails: {
      firstName: '',
      lastName: ''
    },
    learnerData: {
      timeToLearn: '',
      interests: ''
    },
    speakingData: {
      transcription: ''
    },
    opinionData: {
      transcription: '',
      analysis: ''
    },
    listeningScore: 0,
    readingScore: 0,
    writingData: {
      email: ''
    }
  });

  const nextPage = () => setCurrentPage((prev) => prev + 1);

  const updateUserData = (key: string, value: any) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <WelcomePage onNext={nextPage} />;
      case 2:
        return <ContactDetailsPage onNext={nextPage} updateUserData={updateUserData} />;
      case 3:
        return <LearnerDataPage onNext={nextPage} updateUserData={updateUserData} />;
      case 4:
        return <SpeakingPage onNext={nextPage} updateUserData={updateUserData} />;
      case 5:
        return <OpinionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 6:
        return <ListeningComprehensionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 7:
        return <ReadingComprehensionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 8:
        return <WritingPage onNext={nextPage} updateUserData={updateUserData} />;
      case 9:
        return <ReportPage userData={userData} onNext={nextPage} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}