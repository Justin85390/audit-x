'use client';

import { useEffect, useState } from 'react';

interface UserData {
  contactDetails: Record<string, any>;
  learnerData: Record<string, any>;
  speakingData: Record<string, any>;
  opinionData: Record<string, any>;
  writingData: Record<string, any>;
  needsAnalysis: any[];
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Instead of fetching from API, get from localStorage
    try {
      const data = {
        contactDetails: JSON.parse(localStorage.getItem('contactDetails') || '{}'),
        learnerData: JSON.parse(localStorage.getItem('learnerPreferences') || '{}'),
        speakingData: JSON.parse(localStorage.getItem('speakingData') || '{}'),
        opinionData: JSON.parse(localStorage.getItem('opinionData') || '{}'),
        writingData: JSON.parse(localStorage.getItem('writingData') || '{}'),
        needsAnalysis: JSON.parse(localStorage.getItem('needsAnalysis') || '[]')
      };
      setUserData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Assessment Dashboard</h1>
      {/* Display user data here */}
    </div>
  );
} 