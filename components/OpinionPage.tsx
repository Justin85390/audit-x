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
  const [error, setError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/OpinionPage2.mp4"
  };

  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Your Opinion",
      question: "Do you prefer working at home or at the office?",
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
      
      // Try different MIME types
      let options;
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else {
        options = {}; // Let browser choose
      }

      const mediaRecorder = new MediaRecorder(stream, options);
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
      setError('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = async () => {
    console.log('Current user email in localStorage:', localStorage.getItem('userEmail'));
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
        
        const audioBlob = new Blob(audioChunksRef.current);
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData
        });
        console.log('Transcription API response:', response.status);

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
        console.log('Analysis API response:', analysisResponse.status);

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setAnalysis(analysisData.analysis);

          // Get SpeechAce analysis
          try {
            // Create FormData for SpeechAce
            const speechaceFormData = new FormData();
            speechaceFormData.append('audio', audioBlob, 'audio.webm');
            speechaceFormData.append('text', transcriptionText);

            const speechaceResponse = await fetch('/api/speechace', {
              method: 'POST',
              body: speechaceFormData
            });
            console.log('SpeechAce API response status:', speechaceResponse.status);

            if (speechaceResponse.ok) {
              const speechaceData = await speechaceResponse.json();
              console.log('Raw SpeechAce response:', JSON.stringify(speechaceData, null, 2));

              // Extract scores from word_score_list
              const wordScores = speechaceData.analysis?.text_score?.word_score_list || [];
              const averageQualityScore = wordScores.reduce((sum, word) => 
                sum + (word.quality_score || 0), 0) / (wordScores.length || 1);

              // Format the data before saving
              const formattedSpeechaceData = {
                success: speechaceData.success,
                analysis: {
                  status: speechaceData.analysis?.status,
                  pronunciation_score: averageQualityScore.toFixed(1),
                  fluency_score: (averageQualityScore * 0.9).toFixed(1), // Temporary calculation
                  vocabulary_score: (averageQualityScore * 0.8).toFixed(1), // Temporary calculation
                  grammar_score: (averageQualityScore * 0.85).toFixed(1), // Temporary calculation
                  technical_score: averageQualityScore.toFixed(1),
                  word_scores: wordScores.map(word => ({
                    word: word.word,
                    score: word.quality_score
                  }))
                }
              };

              console.log('Extracted scores:', {
                averageQuality: averageQualityScore,
                wordCount: wordScores.length,
                firstFewWords: wordScores.slice(0, 3).map(w => ({
                  word: w.word,
                  score: w.quality_score
                }))
              });

              // Save to Supabase with formatted data
              const userEmail = localStorage.getItem('userEmail');
              if (!userEmail) throw new Error('No user email found');

              const { error } = await supabase
                .from('users')
                .update({
                  speaking_opinion_transcript: transcriptionText,
                  speaking_openai_analysis: analysisData.analysis,
                  speaking_speechace_analysis: JSON.stringify(formattedSpeechaceData)
                })
                .eq('email', userEmail);

              if (error) throw error;

              console.log('All analyses complete with formatted data:', {
                transcript: transcriptionText,
                openaiAnalysis: analysisData.analysis,
                speechaceAnalysis: formattedSpeechaceData
              });

              // Update local state with formatted data
              updateUserData('opinionData', {
                transcription: transcriptionText,
                openaiAnalysis: analysisData.analysis,
                speechaceAnalysis: formattedSpeechaceData,
                timestamp: new Date().toISOString()
              });
            }
          } catch (speechaceError) {
            console.error('SpeechAce error:', speechaceError);
            // Continue even if SpeechAce fails
          }
        }

      } catch (error) {
        console.error('Recording error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getAnalysis = async (text: string) => {
    try {
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis error: ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.analysis);

      // Save to Supabase
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('No user email found in localStorage');
        throw new Error('No user email found');
      }

      console.log('Attempting to save for user:', userEmail);

      const { error, data } = await supabase
        .from('users')
        .update({
          speaking_opinion_transcript: text,
          speaking_openai_analysis: analysisData.analysis,
          speaking_speechace_analysis: JSON.stringify({
            success: true,
            analysis: {
              status: 'manual',
              pronunciation_score: '0',
              fluency_score: '0',
              vocabulary_score: '0',
              grammar_score: '0',
              technical_score: '0'
            }
          })
        })
        .eq('email', userEmail)
        .select();

      console.log('Update response:', { error, data });

      if (error) throw error;

      // Update local state
      updateUserData('opinionData', {
        transcription: text,
        openaiAnalysis: analysisData.analysis,
        speechaceAnalysis: null,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze the response. Please try again.');
    }
  };

  // Add useEffect for video autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .catch(e => {
          console.error('Video autoplay failed:', e);
          setAutoplayFailed(true);
        });
    }
  }, []); // Empty dependency array since we only want this on mount

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-end mb-4">
          <button 
            className="p-1 rounded ring-2 ring-blue-500"
          >
            <img
              src="/images/flags/gb-flag.png"
              alt="English"
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
            src={videoUrls.en}
            playsInline
            autoPlay
            controls
            className="rounded-lg mb-6"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {/* French Instructions Toggle */}
          <div className="w-full flex flex-col items-center mb-6">
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-2"
            >
              {showInstructions ? 'Masquer' : 'Afficher'} les instructions en français
              <span className="w-6 h-4 inline-flex items-center">
                🇷
              </span>
            </button>

            {showInstructions && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 animate-fadeIn mt-4">
                <p>
                  Merci pour vos réponses à la partie 1 et bienvenue à la partie 2 de l'audit. 
                  La première partie évalue vos compétences en matière d'expression orale en anglais. 
                  Votre tâche consiste à parler pendant 45 secondes. La question est la suivante : 
                  Préférez-vous travailler à la maison ou au bureau ? Essayez de donner deux exemples 
                  pour étayer votre opinion. Prenez le temps de réfléchir et, lorsque vous êtes prêt, 
                  commencez votre enregistrement. Pendant que vous parlez, utilisez le schéma sur l'écran 
                  pour vous aider à structurer vos pensées. Une bonne façon de commencer est de dire 
                  "A mon avis..." .
                </p>
              </div>
            )}
          </div>

          {autoplayFailed && (
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>🔊</span> {languageContent[language].videoButton}
            </button>
          )}
        </div>

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
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                text-white font-bold py-3 px-6 rounded-full transition-colors
                flex items-center justify-center min-w-[200px]
                mb-4
              `}
            >
              {isLoading ? 'Analyzing...' : 
               isRecording ? languageContent[language].stopButton : 
               analysis ? 'Complete' :
               languageContent[language].recordButton}
            </button>

            {analysis && !isLoading && (
              <button
                onClick={onNext}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
              >
                {languageContent[language].continueButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}