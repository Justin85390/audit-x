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
import NeedsAnalysisPage from '@/components/NeedsAnalysisPage';
import { UserData } from '@/types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('welcome');
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
  });

  const nextPage = () => setCurrentPage((prev) => {
    switch (prev) {
      case 'welcome':
        return 'contact';
      case 'contact':
        return 'learnerData';
      case 'learnerData':
        return 'needsAnalysis';
      case 'needsAnalysis':
        return 'speaking';
      case 'speaking':
        return 'opinion';
      case 'opinion':
        return 'listeningComprehension';
      case 'listeningComprehension':
        return 'readingComprehension';
      case 'readingComprehension':
        return 'writing';
      case 'writing':
        return 'report';
      default:
        return prev;
    }
  });

  const updateUserData = (key: string, data: any) => {
    console.log('Updating user data:', key, data);
    setUserData(prev => {
      if (key === 'learnerData') {
        const learnerData = {
          timeToLearn: data.timeToLearn || '',
          motivation: Array.isArray(data.motivation) ? data.motivation : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          device: Array.isArray(data.device) ? data.device : [],
          contentType: Array.isArray(data.contentType) ? data.contentType : [],
          classroomFormat: Array.isArray(data.classroomFormat) ? data.classroomFormat : []
        };
        return { ...prev, [key]: learnerData };
      }
      return { ...prev, [key]: data };
    });
  };

  const handleNext = () => {
    console.log('Audit completed:', userData);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNext={nextPage} />;
      case 'contact':
        return <ContactDetailsPage onNext={nextPage} updateUserData={updateUserData} />;
      case 'learnerData':
        return <LearnerDataPage
          onNext={nextPage}
          updateUserData={updateUserData}
        />;
      case 'needsAnalysis':
        return <NeedsAnalysisPage
          onNext={nextPage}
          updateUserData={updateUserData}
        />;
      case 'speaking':
        return <SpeakingPage
          onNext={nextPage}
          updateUserData={updateUserData}
        />;
      case 'writing':
        return <WritingPage onNext={nextPage} updateUserData={updateUserData} />;
      case 'opinion':
        return <OpinionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 'listeningComprehension':
        return <ListeningComprehensionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 'readingComprehension':
        return <ReadingComprehensionPage onNext={nextPage} updateUserData={updateUserData} />;
      case 'report':
        return <ReportPage 
          onNext={handleNext}
          updateUserData={updateUserData}
          userData={userData}
        />;
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
