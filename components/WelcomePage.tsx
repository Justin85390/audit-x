'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import InputField from './shared/InputField';
import AIAnimation from './shared/AIAnimation';
import { useLanguage } from '../app/contexts/LanguageContext';
import { Language } from '@/types';

interface LanguageContent {
  title: string;
  journey: string;
  playButton: string;
  readyButton: string;
  askOliver: string;
  typingPlaceholder: string;
  processingMessage: string;
  defaultGreeting: string;
  suggestedQuestion: string;
}

interface WelcomePageProps {
  onNext: () => void;
  onLanguageChange?: (language: Language) => void;
}

export default function WelcomePage({ onNext, onLanguageChange }: WelcomePageProps) {
  const { language, setLanguage } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oliverResponse, setOliverResponse] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Move videoUrls outside component or use useMemo
  const videoUrls = React.useMemo(() => ({
    en: "https://justindonlon.com/wp-content/uploads/2025/01/Welcome-Page2.mp4",
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-Welcome-Page2.mp4"
  }), []); // Empty dependency array since URLs are static

  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Welcome to Linguaphone",
      journey: "Your journey starts with just a few questions. Press \"Ready\" to begin.",
      playButton: "Play Video",
      readyButton: "Ready",
      askOliver: "Ask Oliver",
      typingPlaceholder: "Type your question for Oliver...",
      processingMessage: "Processing...",
      defaultGreeting: "Hello! I'm Oliver, your language audit assistant. How can I help you today?",
      suggestedQuestion: "Ask about the audit"
    },
    fr: {
      title: "Bienvenue chez Linguaphone",
      journey: "Votre parcours commence par quelques questions. Appuyez sur \"Prêt\" pour commencer.",
      playButton: "Lire la Vidéo",
      readyButton: "Prêt",
      askOliver: "Demander à Oliver",
      typingPlaceholder: "Tapez votre question pour Oliver...",
      processingMessage: "Traitement en cours...",
      defaultGreeting: "Bonjour! Je suis Oliver, votre assistant d'audit linguistique. Comment puis-je vous aider?",
      suggestedQuestion: "Demander à propos de l'audit"
    }
  };

  const startRecording = async () => {
    try {
      // First request permissions explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      // Create MediaRecorder with specific mime type and options
      const options = { 
        mimeType: 'audio/webm;codecs=opus'  // Specify codec
      };
      
      audioChunksRef.current = []; // Reset chunks
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
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
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          setIsLoading(true);
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transcription failed');
          
          const data = await response.json();
          setUserTranscript(data.transcription);
          
          // Use oliver-chat instead of chat to get voice response
          setIsThinking(true);
          const chatResponse = await fetch('/api/oliver-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.transcription })
          });

          if (!chatResponse.ok) throw new Error('Chat response failed');
          
          const chatData = await chatResponse.json();
          setOliverResponse(chatData.response);

          // Play Oliver's voice response
          if (chatData.audioUrl) {
            const audio = new Audio(chatData.audioUrl);
            setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            await audio.play();
          }
          
        } catch (error) {
          console.error('Processing error:', error);
          setError('Failed to process audio. Please try again.');
        } finally {
          setIsLoading(false);
          setIsThinking(false);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const getOliverResponse = async (text: string) => {
    try {
      setIsThinking(true);
      const response = await fetch('/api/oliver-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, isTyped: true }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setOliverResponse(data.response);

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      }
    } catch (error) {
      console.error('Error getting Oliver response:', error);
      setError('Failed to get Oliver\'s response. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendTypedQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    try {
      setIsLoading(true);
      setUserTranscript(userQuestion);
      await getOliverResponse(userQuestion);
      setUserQuestion('');
    } catch (error) {
      console.error('Error sending question:', error);
      setError('Failed to send question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play()
        .catch(e => {
          console.error('Video autoplay failed:', e);
          setAutoplayFailed(true);
        });
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  // Add useEffect to handle video source changes
  useEffect(() => {
    if (videoRef.current) {
      // Force video to reload when language changes
      videoRef.current.load();
      console.log('Video source changed to:', videoUrls[language]);
    }
  }, [language]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .catch(e => {
          console.error('Video autoplay failed:', e);
          setAutoplayFailed(true);
        });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      {/* Video Section */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          {/* Logo */}
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/Linguaphone-logo-80-60.png`}
            alt="Linguaphone Logo"
            width={80}
            height={60}
            className="rounded shadow-sm"
          />
          
          {/* Language Toggle */}
          <div className="flex space-x-2">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={`p-1 rounded ${language === 'en' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/english-53-40.png`}
                alt="English"
                width={53}
                height={40}
                className="rounded shadow-sm"
              />
            </button>
            <button 
              onClick={() => handleLanguageChange('fr')}
              className={`p-1 rounded ${language === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/french-53-40.png`}
                alt="Français"
                width={53}
                height={40}
                className="rounded shadow-sm"
              />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-center">
          {languageContent[language].title}
        </h1>

        {/* Video Player */}
        <div className="w-full flex justify-center mb-6">
          <video
            ref={videoRef}
            width="800"
            height="400"
            controls
            playsInline
            className="rounded-lg"
            key={language}
          >
            <source 
              src={videoUrls[language]} 
              type="video/mp4"
              onError={(e) => console.error('Video source error:', e)}
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Play Button */}
        <button 
          onClick={handlePlayVideo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mb-4"
        >
          <span>▶️</span> {languageContent[language].playButton}
        </button>

        <p className="text-lg mb-4 text-center text-gray-600">
          {languageContent[language].journey}
        </p>

        <div className="flex justify-center">
          <button 
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full"
          >
            {languageContent[language].readyButton}
          </button>
        </div>
      </div>

      {/* Oliver Section */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Oliver Header */}
        <div className="flex items-center mb-6">
          <div className="w-24 flex-shrink-0 mr-6">
            <Image
              src="/oliveravatar.png"
              alt="Oliver Avatar"
              width={96}
              height={96}
              className="rounded-full border-4 border-gray-200"
              priority
            />
          </div>
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl font-bold">Oliver</h2>
              <h3 className="text-xl text-gray-600">Your Audit Assistant</h3>
              <h4 className="text-sm text-gray-500 mt-2">
                Type in the box below or ask me a question with "Ask Oliver"
              </h4>
            </div>
          </div>
        </div>

        {/* Inner Box for Interaction */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          {/* Text Input with Send Button */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <InputField
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={languageContent[language].typingPlaceholder}
                className="flex-grow"
              />
              {userQuestion && (
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full"
                  onClick={handleSendTypedQuestion}
                >
                  {languageContent[language].askOliver}
                </button>
              )}
            </div>
            
            {/* Suggestion Bubble */}
            <button 
              onClick={() => setUserQuestion(languageContent[language].suggestedQuestion)}
              className="self-start px-4 py-2 my-4 bg-yellow-50 hover:bg-yellow-100 
                rounded-2xl text-gray-600 text-sm transition-colors duration-200 
                flex items-center gap-2 shadow-sm border border-yellow-100"
            >
              💭 {languageContent[language].suggestedQuestion}
            </button>
          </div>

          {/* User's transcription */}
          {userTranscript && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">You said:</p>
              <p className="text-gray-800">{userTranscript}</p>
            </div>
          )}
          
          {/* Oliver's response */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {oliverResponse || languageContent[language].defaultGreeting}
          </div>
        </div>

        {/* Voice Recording Button */}
        <div className="flex flex-col items-center mt-6">
          <div className="flex items-center justify-center space-x-4 w-full">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2"
              disabled={isLoading}
            >
              {isRecording ? (
                <>
                  <div className="recording-pulse" />
                  Stop Recording
                </>
              ) : (
                <>
                  <span>🎤</span>
                  {languageContent[language].askOliver}
                </>
              )}
            </button>

            <div className="w-12 flex items-center justify-center">
              {(isThinking || isSpeaking) && (
                <AIAnimation isThinking={isThinking} isSpeaking={isSpeaking} />
              )}
            </div>

            {isLoading && (
              <div className="text-gray-600 flex items-center ml-4 whitespace-nowrap">
                <span>{languageContent[language].processingMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}