'use client';

import { useState, useRef, useEffect } from 'react';
import { Language, UserData } from '@/types';
import { useLanguage } from '../app/contexts/LanguageContext';

interface LanguageContent {
  title: string;
  videoButton: string;
}

interface ReportPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  userData?: UserData;
  onLanguageChange?: (language: Language) => void;
}

export default function ReportPage({ onNext, updateUserData, userData, onLanguageChange }: ReportPageProps) {
  const { language, setLanguage } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2024/11/ReportPage.mp4",
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-ReportPage.mp4"
  };

  // Language content
  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Your Audit Report",
      videoButton: "Play Video"
    },
    fr: {
      title: "Votre Rapport d'Audit",
      videoButton: "Lire la Vidéo"
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.play();
      } catch (error) {
        console.error('Error playing video:', error);
        setAutoplayFailed(true);
      }
    }
  }, [language]);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Update language toggle handlers
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Update Language Toggle buttons */}
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`p-1 rounded ${language === 'en' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img
              src="/images/flags/gb-flag.png"
              alt="English"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
          <button 
            onClick={() => handleLanguageChange('fr')}
            className={`p-1 rounded ${language === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img
              src="/images/flags/fr-flag.png"
              alt="Français"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6">
          {languageContent[language].title}
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={videoRef}
            src={videoUrls[language]}
            playsInline
            autoPlay
            controls
            muted={false}
            className="rounded-lg mb-6"
            width="100%"
            onError={(e) => {
              console.error('Video loading error:', e);
              setAutoplayFailed(true);
            }}
          >
            Your browser does not support the video tag.
          </video>
          
          {autoplayFailed && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>🔊</span> {languageContent[language].videoButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}