'use client';

import { useState, useRef, useEffect } from 'react';
import { OLIVER_SPEAKING_ASSESSMENT, SpeakingAssessmentData, constructOliverResponse } from '@/app/lib/oliver-instructions';
import Image from 'next/image';

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
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  
  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language);
    if (videoRef) {
      try {
        videoRef.pause();
        videoRef.load();
      } catch (error) {
        console.error('Error handling video on language change:', error);
      }
    }
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  // Combined states
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

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

  useEffect(() => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play().catch((error) => {
        console.log('Autoplay failed:', error);
        setAutoplayFailed(true);
      });
    }
  }, [videoRef]);

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const base64Audio = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(audioBlob);
          });

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-page-type': 'speaking'
            },
            body: JSON.stringify({
              audio: base64Audio,
              context: OLIVER_SPEAKING_ASSESSMENT.context
            })
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const data = await response.json() as TranscriptionData;
          const userTranscription = data.transcription;

          // Store transcript in language-specific array
          const newTranscript: TranscriptItem = {
            speaker: 'user',
            text: userTranscription,
            timestamp: new Date().toISOString(),
            language: currentLanguage // Add language identifier
          };

          // Update transcripts for current language
          setTranscriptHistory(prev => ({
            ...prev,
            [currentLanguage]: [...(prev[currentLanguage] || []), newTranscript]
          }));

          // Store in user data with language context
          updateUserData('speakingData', {
            transcripts: {
              ...transcriptHistory,
              [currentLanguage]: [...(transcriptHistory[currentLanguage] || []), newTranscript]
            },
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Transcription error:', error);
          alert('Error processing your answer. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Error accessing microphone. Please check your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
    setIsSaving(true);
    try {
      // Save the transcripts to your backend or state management
      await updateUserData('speakingData', {
        transcripts: transcriptHistory,
        timestamp: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000); // Reset success state after 2 seconds
    } catch (error) {
      console.error('Error saving transcripts:', error);
      alert(currentLanguage === 'en' ? 'Error saving changes' : 'Erreur lors de l\'enregistrement');
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
            onClick={() => handleLanguageChange('en')}
            className={`p-1 rounded ${currentLanguage === 'en' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Image src="/gb-flag.png" alt="English" width={32} height={24} className="rounded shadow-sm" />
          </button>
          <button 
            onClick={() => handleLanguageChange('fr')}
            className={`p-1 rounded ${currentLanguage === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Image src="/fr-flag.png" alt="Français" width={32} height={24} className="rounded shadow-sm" />
          </button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6">{languageContent[currentLanguage].title}</h1>
        
        {/* Video Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <video
            ref={(el) => setVideoRef(el)}
            src={currentLanguage === 'en' 
              ? "https://justindonlon.com/wp-content/uploads/2025/01/Speaking-Page-2.mp4"
              : "https://justindonlon.com/wp-content/uploads/2025/01/FR-Speaking-Page-2.mp4"
            }
            playsInline
            autoPlay
            controls
            className="rounded-lg mb-6"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {autoplayFailed && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4 mb-6"
            >
              <span>🔊</span> {languageContent[currentLanguage].videoButton}
            </button>
          )}

          {/* Question and Recording Section - Moved from second container */}
          <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">
              {languageContent[currentLanguage].question}
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
                {isLoading ? languageContent[currentLanguage].processingMessage : 
                 isRecording ? languageContent[currentLanguage].stopButton : 
                 languageContent[currentLanguage].recordButton}
              </button>

              {isLoading && (
                <p className="text-gray-600 text-center mt-2">
                  {languageContent[currentLanguage].processingMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recording History Container - Keep this separate */}
      <div className={`w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 transition-opacity duration-500 ${transcriptHistory[currentLanguage]?.length ? 'opacity-100' : 'opacity-0'}`}>
        {/* Recording History */}
        <div className="h-64 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-4">
          {transcriptHistory[currentLanguage]?.map((item, index) => (
            <div
              key={index}
              className="mb-4 text-gray-700"
            >
              <span className="font-semibold">
                {currentLanguage === 'en' ? 'Your Response' : 'Votre Réponse'}:
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
                        const updatedTranscripts = [...transcriptHistory[currentLanguage]];
                        updatedTranscripts[index] = {
                          ...updatedTranscripts[index],
                          text: editingText
                        };
                        setTranscriptHistory({
                          ...transcriptHistory,
                          [currentLanguage]: updatedTranscripts
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
                      {currentLanguage === 'en' ? 'Edit Transcript' : 'Modifier la transcription'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingIndex(index);
                        setEditingText(item.text);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-4xl opacity-75 group-hover:opacity-100 transition-opacity"
                      title={currentLanguage === 'en' ? 'Edit text' : 'Modifier le texte'}
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
              {isLoading ? languageContent[currentLanguage].processingMessage : 
               isRecording ? languageContent[currentLanguage].stopButton : 
               languageContent[currentLanguage].reRecordButton}
            </button>

            {transcriptHistory[currentLanguage]?.length > 0 && (
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
                  currentLanguage === 'en' ? 'Saving...' : 'Enregistrement...'
                ) : saveSuccess ? (
                  '✓'
                ) : (
                  currentLanguage === 'en' ? 'Save Changes' : 'Enregistrer'
                )}
              </button>
            )}
          </div>

          {/* Continue to Part 2 button in a separate row */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onNext}
              className="px-8 py-3 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white 
                         shadow-lg hover:shadow-xl transition-all duration-200 
                         flex items-center justify-center gap-2"
            >
              {languageContent[currentLanguage].continueToPartTwo}
              <span className="text-xl">→</span>
            </button>
            
            <p className="text-sm text-gray-600 italic mt-2">
              {languageContent[currentLanguage].partTwoMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}