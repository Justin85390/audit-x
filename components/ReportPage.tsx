'use client';

interface ReportPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  userData: {
    contactDetails?: {
      name?: string;
      email?: string;
    };
    // Add other userData types as needed
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