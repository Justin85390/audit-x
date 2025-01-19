'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../app/contexts/LanguageContext';
import { Language } from '@/types';

interface LanguageContent {
  title: string;
  question: string;
  recordButton: string;
  stopButton: string;
  processingMessage: string;
  continueButton: string;
  videoButton: string;
  analysisTitle: string;
  reRecordButton: string;
}

interface OpinionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

export default function OpinionPage({ onNext, updateUserData, onLanguageChange }: OpinionPageProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout>();

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/Opinion-Page2.mp4",
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-Opinion-Page2.mp4"
  };

  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Your Opinion",
      question: "What do you think about learning English online versus in a classroom?",
      recordButton: "Start Recording (45s)",
      stopButton: "Stop Recording",
      processingMessage: "Processing audio...",
      continueButton: "Continue",
      videoButton: "Play Video",
      analysisTitle: "Analysis",
      reRecordButton: "Record Again"
    },
    fr: {
      title: "Votre Opinion",
      question: "Que pensez-vous de l'apprentissage de l'anglais en ligne par rapport à une salle de classe?",
      recordButton: "Commencer l'Enregistrement (45s)",
      stopButton: "Arrêter l'Enregistrement",
      processingMessage: "Traitement audio...",
      continueButton: "Continuer",
      videoButton: "Lire la Vidéo",
      analysisTitle: "Analyse",
      reRecordButton: "Réenregistrer"
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
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [language]);

  const startTimer = () => {
    setTimeLeft(45);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          stopRecording();
          clearInterval(timerRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });

        // First get transcription
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transcriptionText = data.transcription || data.text;
        setTranscription(transcriptionText);

        // Then get analysis
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: transcriptionText }),
        });

        if (!analysisResponse.ok) {
          throw new Error(`Analysis error: ${analysisResponse.status}`);
        }

        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData.analysis);

        // Save to Supabase
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) throw new Error('No user email found');

        const { error } = await supabase
          .from('users')
          .update({
            opinion_transcript: transcriptionText,
            opinion_analysis: analysisData.analysis
          })
          .eq('email', userEmail);

        if (error) throw error;

        // Update local state
        updateUserData('opinionData', {
          transcription: transcriptionText,
          analysis: analysisData.analysis,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Recording error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            onClick={() => onLanguageChange?.('en')}
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
            onClick={() => onLanguageChange?.('fr')}
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

        {/* Question and Recording Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            {languageContent[language].question}
          </h2>

          <div className="flex flex-col items-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`
                ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                text-white font-bold py-3 px-6 rounded-full transition-colors
                flex items-center justify-center gap-2 min-w-[200px]
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <span>{languageContent[language].processingMessage}</span>
              ) : isRecording ? (
                <>
                  <span>{languageContent[language].stopButton}</span>
                  <span>({timeLeft}s)</span>
                </>
              ) : (
                <span>{languageContent[language].recordButton}</span>
              )}
            </button>

            {isLoading && (
              <p className="text-gray-600 text-center mt-4">
                {languageContent[language].processingMessage}
              </p>
            )}
          </div>
        </div>

        {/* Analysis Section */}
        {(transcription || analysis) && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            {transcription && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Your Response:</h3>
                <p className="text-gray-700">{transcription}</p>
              </div>
            )}
            
            {analysis && (
              <div>
                <h3 className="font-semibold mb-2">{languageContent[language].analysisTitle}:</h3>
                <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        {analysis && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onNext}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              {languageContent[language].continueButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}