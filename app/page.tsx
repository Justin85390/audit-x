"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import WelcomePage from '@/components/WelcomePage';
import ContactDetailsPage from '@/components/ContactDetailsPage';
import LearnerDataPage from '@/components/LearnerDataPage';
import SpeakingPage from '@/components/SpeakingPage';
import OpinionPage from '@/components/OpinionPage';
import ListeningComprehensionPage from '@/components/ListeningComprehensionPage';
import ReadingComprehensionPage from '@/components/ReadingComprehensionPage';
import WritingPage from '@/components/WritingPage';
import ReportPage from '@/components/ReportPage';

interface UserData {
  contactDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    age: string;
    company: string;
    jobTitle: string;
    address: string;
  };
  learnerData: {
    timeToLearn: string;
    motivation: string;
    interests: string;
    device: string;
    contentType: string;
    classroomFormat: string;
  };
  speakingData: {
    transcription: string;
  };
  opinionData: {
    transcription: string;
    analysis: string;
  };
  listeningScore: number;
  readingScore: number;
  writingData: {
    email: string;
  };
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    contactDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      age: '',
      company: '',
      jobTitle: '',
      address: ''
    },
    learnerData: {
      timeToLearn: '',
      motivation: '',
      interests: '',
      device: '',
      contentType: '',
      classroomFormat: ''
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

  const updateUserData = (key: string, data: any) => {
    console.log('Updating user data:', key, data);
    setUserData(prev => {
      const newData = { ...prev, [key]: data };
      console.log('New userData state:', newData);
      return newData;
    });
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