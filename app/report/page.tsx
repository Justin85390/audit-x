"use client";

import { useEffect, useState } from 'react';
import ReportPage from '@/components/ReportPage';
import { transformDatabaseData } from '@/app/utils/transformDatabaseData';
import { supabase } from '@/app/lib/supabase';
import { UserData } from '@/app/types';

export default function Report() {
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  useEffect(() => {
    async function fetchUserData() {
      // Get email from localStorage (set during the assessment)
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          speaking_speechace_analysis,
          speaking_opinion_transcript,
          speaking_openai_analysis,
          listening_score,
          reading_score,
          writing_submission,
          writing_openai_analysis
        `)
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data) {
        const transformedData = transformDatabaseData(data);
        setUserData(transformedData);
      }
    }

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <ReportPage 
          onNext={() => console.log('Next clicked')}
          updateUserData={(key, value) => console.log('Update:', key, value)}
          userData={userData}
        />
      </main>
    </div>
  );
} 