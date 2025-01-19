'use client';

import { useState, useRef } from 'react';
import { Language, UserData } from '@/types';

interface ReportPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  userData?: UserData;
}

export default function ReportPage({ onNext, updateUserData, userData }: ReportPageProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const initialLoadRef = useRef(true);

  const videoUrl = currentLanguage === 'en' 
    ? "https://justindonlon.com/wp-content/uploads/2025/01/Report2.mp4"
    : "https://justindonlon.com/wp-content/uploads/2025/01/FR-Report2.mp4";

  const handleVideoRef = (el: HTMLVideoElement | null) => {
    if (el && initialLoadRef.current) {
      initialLoadRef.current = false;
      el.muted = false;
      el.play()
        .then(() => {
          setVideoStarted(true);
        })
        .catch(e => {
          console.log('Video autoplay with sound failed:', e);
          el.muted = true;
          el.play().catch(e => console.log('Muted autoplay also failed:', e));
        });
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          {currentLanguage === 'en' ? 'Your Audit Report' : 'Votre Rapport d\'Audit'}
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src={videoUrl}
            playsInline
            autoPlay
            controls
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {!videoStarted && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> Play Video With Sound
            </button>
          )}
        </div>
      </div>
    </div>
  );
}