'use client';

import { useState, useRef, useEffect } from 'react';
import { OLIVER_SPEAKING_ASSESSMENT } from '@/app/lib/oliver-instructions';
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
  replyButton: string;
  continueButton: string;
  videoButton: string;
  continueToPartTwo: string;
  reRecordButton: string;
  partTwoMessage: string;
}

interface SpeakingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

interface TranscriptItem {
  speaker: 'user' | 'oliver';
  text: string;
  timestamp: string;
  language: Language;
}

export default function SpeakingPage({ onNext, updateUserData, onLanguageChange }: SpeakingPageProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>('');

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/Speaking-Page-2.mp4",
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-Speaking-Page-2.mp4"
  };

  // Language content
  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Let's Talk",
      question: "Tell me about your difficulties when using English and any help that you specifically need.",
      recordButton: "Record your Answer",
      stopButton: "Stop Recording",
      processingMessage: "Processing audio... This may take a few moments.",
      replyButton: "Reply to Oliver",
      continueButton: "Continue",
      videoButton: "Play Video",
      continueToPartTwo: "Continue to Part 2",
      reRecordButton: "Re-record your Answer",
      partTwoMessage: "Part 2 Audit Assessment is in English with instructions in French"
    },
    fr: {
      title: "Parlons-en",
      question: "Parlez-moi de vos difficultés en anglais et de l'aide dont vous avez spécifiquement besoin.",
      recordButton: "Enregistrer votre réponse",
      stopButton: "Arrêter l'enregistrement",
      processingMessage: "Traitement audio... Cela peut prendre quelques instants.",
      replyButton: "Répondre à Oliver",
      continueButton: "Continuer",
      videoButton: "Lire la vidéo",
      continueToPartTwo: "Continuer à la partie 2",
      reRecordButton: "Ré-enregistrer votre réponse",
      partTwoMessage: "La partie 2 de l'évaluation est en anglais avec les instructions en français"
    }
  };

  // Update the useEffect for video handling
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });

      // Specify the correct MIME type that OpenAI accepts
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      setError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm' 
          });
          
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          setIsLoading(true);
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const transcriptionText = data.transcription || data.text;
          setUserTranscript(transcriptionText);

          // Get analysis
          await getAnalysis(transcriptionText);

        } catch (error) {
          console.error('Transcription error:', error);
          setError('Failed to transcribe audio. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const getAnalysis = async (text: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      if (data.analysis) {
        const newTranscript: TranscriptItem = {
          speaker: 'user',
          text: text,
          timestamp: new Date().toISOString(),
          language
        };
        setTranscriptHistory(prev => [...prev, newTranscript]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze response. Please try again.');
    }
  };

  const handleSaveTranscripts = async () => {
    try {
      setIsSaving(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      const transcriptText = transcriptHistory
        .map(item => item.text)
        .join(' ');

      const { error } = await supabase
        .from('users')
        .update({
          speaking_difficulties_transcript: transcriptText
        })
        .eq('email', userEmail);

      if (error) throw error;
      
      setSaveSuccess(true);
      onNext();
    } catch (error) {
      console.error('Error saving speaking transcript:', error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Single Combined Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
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

        <h1 className="text-4xl font-bold text-center mb-6">{languageContent[language].title}</h1>
        
        {/* Video Section */}
        <div className="w-full flex flex-col items-center mb-8">
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
            <source src={videoUrls[language]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {autoplayFailed && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4 mb-6"
            >
              <span>🔊</span> {languageContent[language].videoButton}
            </button>
          )}

          {/* Question and Recording Section - Moved from second container */}
          <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">
              {languageContent[language].question}
            </h3>
            <div className="flex flex-col items-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2"
                disabled={isLoading}
              >
                {isRecording ? (
                  <>
                    <span className="animate-pulse">⏺</span>
                    Stop Recording
                  </>
                ) : (
                  <>
                    <span>🎤</span>
                    Record Your Answer
                  </>
                )}
              </button>

              {isLoading && (
                <p className="text-gray-600 text-center mt-2">
                  {languageContent[language].processingMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recording History Container - Keep this separate */}
      <div className={`w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 transition-opacity duration-500 ${transcriptHistory.length ? 'opacity-100' : 'opacity-0'}`}>
        {/* Recording History */}
        <div className="h-64 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-4">
          {transcriptHistory.map((item, index) => (
            <div
              key={index}
              className="mb-4 text-gray-700"
            >
              <span className="font-semibold">
                {language === 'en' ? 'Your Response' : 'Votre Réponse'}:
              </span>
              <div className="flex justify-between items-center group">
                <span>{item.text}</span>
                <div className="flex flex-col items-center ml-4">
                  <span className="text-sm text-blue-500 mb-1">
                    {language === 'en' ? 'Edit Transcript' : 'Modifier la transcription'}
                  </span>
                  <button
                    onClick={() => {
                      const updatedTranscripts = [...transcriptHistory];
                      updatedTranscripts[index] = {
                        ...updatedTranscripts[index],
                        text: 'New edited text'
                      };
                      setTranscriptHistory(updatedTranscripts);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-4xl opacity-75 group-hover:opacity-100 transition-opacity"
                    title={language === 'en' ? 'Edit text' : 'Modifier le texte'}
                  >
                    ✎
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col items-center space-y-4">
          {/* Recording and Save buttons row */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={stopRecording}
              disabled={isLoading}
              className={`
                ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                text-white font-bold py-3 px-6 rounded-full transition-colors
                flex items-center justify-center min-w-[200px]
                mb-4
              `}
            >
              {isLoading ? languageContent[language].processingMessage : 
               isRecording ? languageContent[language].stopButton : 
               languageContent[language].reRecordButton}
            </button>

            {transcriptHistory.length > 0 && (
              <button
                onClick={handleSaveTranscripts}
                disabled={isSaving}
                className={`
                  ${saveSuccess ? 'bg-green-500' : 'bg-yellow-500 hover:bg-yellow-600'}
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                  text-white font-bold py-2 px-6 rounded-full transition-colors
                  flex items-center justify-center
                `}
              >
                {isSaving ? (
                  language === 'en' ? 'Saving...' : 'Enregistrement...'
                ) : saveSuccess ? (
                  '✓'
                ) : (
                  language === 'en' ? 'Save Changes' : 'Enregistrer'
                )}
              </button>
            )}
          </div>

          {/* Continue to Part 2 button in a separate row */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const userEmail = localStorage.getItem('userEmail');
                  if (!userEmail) throw new Error('No user email found');

                  // Get the latest transcript
                  const transcriptText = transcriptHistory
                    .map(item => item.text)
                    .join(' ');

                  // Save to database
                  const { error } = await supabase
                    .from('users')
                    .update({
                      speaking_difficulties_transcript: transcriptText
                    })
                    .eq('email', userEmail);

                  if (error) throw error;

                  // Continue to next page
                  onNext();
                } catch (error) {
                  console.error('Error saving transcript:', error);
                }
              }}
              className="px-8 py-3 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white 
                         shadow-lg hover:shadow-xl transition-all duration-200 
                         flex items-center justify-center gap-2"
            >
              {languageContent[language].continueToPartTwo}
              <span className="text-xl">→</span>
            </button>
            
            <p className="text-sm text-gray-600 italic mt-2">
              {languageContent[language].partTwoMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}