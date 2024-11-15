'use client';

import React, { useState, useRef, useContext, useEffect } from 'react';
import { Button } from "./ui/button";
import { UserContext } from '../context/UserContext';

type Timeout = ReturnType<typeof setTimeout>;

interface OpinionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function OpinionPage({ onNext, updateUserData }: OpinionPageProps) {
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<Timeout | null>(null);
  const { userData, setUserData } = useContext(UserContext);
  const videoId = "xIb8oYnc9gA";  // Updated YouTube video ID
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

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

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
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

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    setIsLoading(true);
    const mediaRecorder = mediaRecorderRef.current;
    
    // Set up onstop handler before stopping
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      try {
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(audioBlob);
        });

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`Error: ${data.error}`);
        if (!data.transcription) throw new Error(`No transcription in response`);

        await handleRecordingComplete(data.transcription, audioBlob);
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
      } catch (error) {
        console.error('Transcription error:', error);
        alert(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    stopTimer();
    mediaRecorder.stop();
  };

  const handleRecordingComplete = async (transcription: string, audioBlob: Blob) => {
    try {
      setIsLoading(true);
      console.log('1. Got transcription:', transcription);

      // Run both analyses in parallel
      const [openAIResult, speechAceResult] = await Promise.all([
        // OpenAI Analysis
        (async () => {
          console.log('2. Starting OpenAI analysis...');
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: transcription,
              type: 'opinion'
            })
          });
          const data = await response.json();
          console.log('3. OpenAI analysis complete:', data);
          return data;
        })(),

        // SpeechAce Analysis
        (async () => {
          console.log('4. Starting SpeechAce analysis...');
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('text', transcription);

          const response = await fetch('/api/speechace', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          console.log('5. SpeechAce analysis complete:', data);
          return data;
        })().catch(error => {
          console.error('SpeechAce analysis failed:', error);
          return null; // Return null if SpeechAce fails
        })
      ]);

      // Update user data with both analyses
      const newData = {
        transcription,
        analysis: openAIResult.analysis,
        speechAceAnalysis: speechAceResult,
        timestamp: new Date().toISOString()
      };

      console.log('OpinionPage - Full speechAceResult:', speechAceResult);
      console.log('OpinionPage - newData being saved:', newData);

      updateUserData('opinionData', newData);
      console.log('7. Moving to next page');
      
      onNext();

    } catch (error) {
      console.error('Error:', error);
      alert('Error processing your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Express an Opinion</h1>
        
        <div className="flex flex-col items-center space-y-8">
          {/* Video Container */}
          <div className="w-full flex justify-center">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-lg"
            />
          </div>
          
          {/* Question and Recording Container */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
            {isRecording && (
              <div className="text-center mb-4 text-xl font-semibold">
                Time remaining: {timeLeft}s
              </div>
            )}
            <h3 className="text-2xl font-semibold text-center mb-2 text-gray-800">
              Question: &apos;What is the most important skill for success in life?&apos;
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              Record your answer for 35 to 45 seconds.
            </p>
            <div className="flex justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`
                  ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  text-white font-bold py-3 px-6 rounded-full transition-colors
                  flex items-center justify-center min-w-[200px]
                `}
              >
                {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Record your Answer'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          Processing your audio... This may take a few moments.
        </div>
      )}
    </div>
  );
}