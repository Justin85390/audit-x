'use client';

import ReportPage from '@/components/ReportPage';
import { useSearchParams } from 'next/navigation';

export default function Report() {
  const searchParams = useSearchParams();
  const speechaceData = searchParams?.get('speechaceData');
  
  console.log('Raw speechaceData from URL:', speechaceData);

  let userData = {
    opinionData: null,
    contactDetails: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '123-456-7890'
    },
    learnerData: {
      timeToLearn: '2-3 hours per day',
      motivation: 'High',
      interests: 'Business English'
    },
    speakingData: {
      transcription: ''
    },
    listeningCorrectAnswers: 0,
    listeningScore: 0,
    readingCorrectAnswers: 0,
    readingScore: 0,
    writingData: {
      email: '',
      analysis: ''
    }
  };

  try {
    if (speechaceData) {
      const parsedData = JSON.parse(speechaceData);
      console.log('Parsed speechaceData:', parsedData);
      
      userData = {
        ...userData,
        opinionData: parsedData
      };
    }
  } catch (error) {
    console.error('Error parsing speechaceData:', error);
  }

  const handleNext = () => {
    console.log('Moving to next step...');
  };

  return <ReportPage 
    userData={userData}
    onNext={handleNext}
  />;
}
