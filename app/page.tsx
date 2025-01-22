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
  const [currentPage, setCurrentPage] = useState<string>('welcome');
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

  const pageOrder = {
    'welcome': 'contact',
    'contact': 'learnerData',
    'learnerData': 'needsAnalysis',
    'needsAnalysis': 'speaking',
    'speaking': 'opinion',
    'opinion': 'listeningComprehension',
    'listeningComprehension': 'readingComprehension',
    'readingComprehension': 'writing',
    'writing': 'report'
  };

  const handleNext = () => {
    setCurrentPage(pageOrder[currentPage]);
  };

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

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNext={handleNext} />;
      case 'contact':
        return <ContactDetailsPage onNext={handleNext} updateUserData={updateUserData} />;
      case 'learnerData':
        return <LearnerDataPage
          onNext={handleNext}
          updateUserData={updateUserData}
        />;
      case 'needsAnalysis':
        return <NeedsAnalysisPage
          onNext={handleNext}
          updateUserData={updateUserData}
        />;
      case 'speaking':
        return <SpeakingPage
          onNext={handleNext}
          updateUserData={updateUserData}
        />;
      case 'writing':
        return <WritingPage onNext={handleNext} updateUserData={updateUserData} />;
      case 'opinion':
        return <OpinionPage onNext={handleNext} updateUserData={updateUserData} />;
      case 'listeningComprehension':
        return <ListeningComprehensionPage onNext={handleNext} updateUserData={updateUserData} />;
      case 'readingComprehension':
        return <ReadingComprehensionPage onNext={handleNext} updateUserData={updateUserData} />;
      case 'report':
        return <ReportPage 
          onNext={handleNext}
          updateUserData={updateUserData}
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
