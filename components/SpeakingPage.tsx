'use client';

import { useState, useRef, useEffect } from 'react';
import { OLIVER_SPEAKING_ASSESSMENT, SpeakingAssessmentData, constructOliverResponse } from '@/app/lib/oliver-instructions';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../app/contexts/LanguageContext';

type Language = 'en' | 'fr';

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

interface SpeakingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

interface TranscriptionData {
  transcription: string;
  audioUrl?: string;
  error?: string;
  status?: number;
}

interface TranscriptionResponse {
  transcription: string;
  audioUrl?: string;
}

interface TranscribeAPIRequest {
  text: string;
  isTyped: boolean;
  context: string;
  forceResponse: string;
}

// Add new interface for language-specific transcripts
interface LanguageTranscripts {
  en: TranscriptItem[];
  fr: TranscriptItem[];
}

// Update the TranscriptItem interface to include the language property
interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: string;
  language: Language;
}

export default function SpeakingPage({ onNext, updateUserData, onLanguageChange }: SpeakingPageProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleLanguageChange = async (newLanguage: Language) => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.load();
      } catch (error) {
        console.error('Error handling video on language change:', error);
      }
    }
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  // Combined states
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add state for tracking questions and transcripts
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState<LanguageTranscripts>({
    en: [],
    fr: []
  });

  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Add new state for editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Add these state variables at the top of the component
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update the video URLs to match the correct paths
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/Speaking-Page-2.mp4",  // Fixed URL
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-Speaking-Page-2.mp4"  // Fixed URL
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Specify codec
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording with a timeslice to get data more frequently
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      try {
        // Stop recording and tracks
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);

        setIsLoading(true);
        
        // Wait for the last chunk of audio data
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Create audio blob with proper MIME type
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        
        console.log('Audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: audioChunksRef.current.length
        });

        // Create FormData
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');

        // Send to transcribe endpoint
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData  // No headers needed for FormData
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Transcription API error:', data);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!data.transcription && !data.text) {
          console.error('No transcription in response:', data);
          throw new Error('No transcription in response');
        }

        // Use either transcription or text property
        const transcriptionText = data.transcription || data.text;
        handleTranscriptionComplete(transcriptionText);

      } catch (error) {
        console.error('Transcription error:', error);
        alert('Failed to transcribe audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSaveTranscripts = async () => {
    console.log('Save function triggered');
    try {
      const userEmail = localStorage.getItem('userEmail');
      console.log('User email:', userEmail);
      console.log('User email:', userEmail); // Debug email

      if (!userEmail) throw new Error('No user email found');

      // Debug transcript history
      console.log('Full transcript history:', transcriptHistory);
      console.log('Current language:', language);

      // Get just the text content
      const transcriptText = transcriptHistory[language]
        ?.map(item => item.text)
        .join(' ');

      console.log('Saving transcript:', transcriptText); // Debug final text

      // Debug Supabase call
      console.log('Sending to Supabase:', {
        email: userEmail,
        speaking_difficulties_transcript: transcriptText
      });

      const { data, error } = await supabase
        .from('users')
        .update({
          speaking_difficulties_transcript: transcriptText
        })
        .eq('email', userEmail)
        .select();

      console.log('Supabase response:', { data, error }); // Debug response

      if (error) throw error;
      
      setSaveSuccess(true);
      onNext();
    } catch (error) {
      console.error('Error saving speaking transcript:', error);
      setSaveSuccess(false);
    }
  };

  const handleTranscriptionComplete = (transcriptionText: string) => {
    const timestamp = new Date().toISOString();
    
    // Add new transcript to history
    setTranscriptHistory(prev => ({
      ...prev,
      [language]: [
        ...prev[language],
        {
          speaker: 'user',
          text: transcriptionText,
          timestamp,
          language: language
        }
      ]
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Single Combined Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Language Toggle */}
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
                onClick={toggleRecording}
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
                 languageContent[language].recordButton}
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
      <div className={`w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 transition-opacity duration-500 ${transcriptHistory[language]?.length ? 'opacity-100' : 'opacity-0'}`}>
        {/* Recording History */}
        <div className="h-64 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-4">
          {transcriptHistory[language]?.map((item, index) => (
            <div
              key={index}
              className="mb-4 text-gray-700"
            >
              <span className="font-semibold">
                {language === 'en' ? 'Your Response' : 'Votre Réponse'}:
              </span>
              {editingIndex === index ? (
                <div className="flex gap-2 mt-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const updatedTranscripts = [...transcriptHistory[language]];
                        updatedTranscripts[index] = {
                          ...updatedTranscripts[index],
                          text: editingText
                        };
                        setTranscriptHistory({
                          ...transcriptHistory,
                          [language]: updatedTranscripts
                        });
                        setEditingIndex(null);
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setEditingText('');
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center group">
                  <span>{item.text}</span>
                  <div className="flex flex-col items-center ml-4">
                    <span className="text-sm text-blue-500 mb-1">
                      {language === 'en' ? 'Edit Transcript' : 'Modifier la transcription'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingIndex(index);
                        setEditingText(item.text);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-4xl opacity-75 group-hover:opacity-100 transition-opacity"
                      title={language === 'en' ? 'Edit text' : 'Modifier le texte'}
                    >
                      ✎
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col items-center space-y-4">
          {/* Recording and Save buttons row */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleRecording}
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

            {transcriptHistory[language]?.length > 0 && (
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
                  const transcriptText = transcriptHistory[language]
                    ?.map(item => item.text)
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