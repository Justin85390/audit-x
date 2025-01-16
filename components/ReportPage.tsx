'use client';

interface ReportPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  userData: {
    contactDetails?: {
      name?: string;
      email?: string;
    };
    learnerData?: {
      timeToLearn?: string;
      motivation?: string[];
      interests?: string[];
      device?: string[];
      contentType?: string[];
      classroomFormat?: string[];
    };
    speakingData?: {
      transcripts?: any;
      timestamp?: string;
    };
    opinionData?: {
      transcription?: string;
      analysis?: string;
      speechAceAnalysis?: any;
      timestamp?: string;
    };
    listeningScore?: number;
    readingScore?: number;
    writingScore?: number;
  };
}

export default function ReportPage({ onNext, updateUserData, userData }: ReportPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Your Audit Report
      </h1>
    </div>
  );
}