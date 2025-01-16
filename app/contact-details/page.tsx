'use client'
import React from 'react';
import ContactDetailsPage from '@/components/ContactDetailsPage'
import { useRouter } from 'next/navigation'

interface ContactData {
  email: string;
  firstName: string;
  lastName: string;
}

export default function Page() {
  const router = useRouter()

  const handleSave = async (data: ContactData) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      console.log('Contact details saved:', data);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  return (
    <ContactDetailsPage 
      onNext={() => router.push('/learner-data')}
      updateUserData={(key, value) => {
        console.log('Updating:', key, value);
        localStorage.setItem(key, JSON.stringify(value));
      }}
      onSave={handleSave}
    />
  )
} 