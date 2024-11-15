// Commented out for future implementation with database
/*
'use client';

import { PersonalizedDashboard } from '@/components/PersonalizedDashboard';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load data when dashboard mounts
    const savedData = localStorage.getItem('reportData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData);
      console.log('Loaded data in Dashboard:', parsedData);
    }
  }, []);

  return <PersonalizedDashboard userData={userData} />;
}
*/
