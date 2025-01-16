'use client'
import LearnerDataPage from '@/components/LearnerDataPage'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <LearnerDataPage 
      onNext={() => router.push('/needs-analysis')}
      updateUserData={(key, value) => {
        console.log('Updating:', key, value)
      }}
    />
  )
} 