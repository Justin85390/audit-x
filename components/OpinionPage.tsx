'use client';

import React, { useState, useRef, useContext, useEffect } from 'react';
import { Button } from "./ui/button";
import { UserContext } from '../context/UserContext';

type Timeout = ReturnType<typeof setTimeout>;

interface OpinionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

const pageTitle = "Part 2: Speaking";

export default function OpinionPage({ onNext, updateUserData }: OpinionPageProps) {
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<Timeout | null>(null);
  const { userData, setUserData } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showReviewStep, setShowReviewStep] = useState(false);
  const initialLoadRef = useRef(true);
  const [showFrenchInstructions, setShowFrenchInstructions] = useState(false);
  const [showReviewInstructions, setShowReviewInstructions] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Clean up audio blob URL when component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

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
      // Pause the video if it's playing
      if (videoRef) {
        videoRef.pause();
      }
      
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

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    const mediaRecorder = mediaRecorderRef.current;
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setShowReviewStep(true);
      
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };

    stopTimer();
    setIsRecording(false);
    mediaRecorder.stop();
  };

  const analyzeWithOpenAI = async (transcription: string) => {
    console.log('2. Starting OpenAI analysis...');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcription,
          prompt: `Please analyze the following English speech sample in terms of:

1. Ability to Understand: Evaluate how well the speaker understands and responds to the topic.

2. Ability to Communicate: Assess fluency, clarity, and effectiveness of expression.

3. CEFR level: Determine the speaker's CEFR level (A1-C2) based on vocabulary, grammar, and overall communication.

4. Key strengths and areas for improvement.

Speech sample to analyze: "${transcription}"

Please format your response with these exact headings:
Ability to Understand:
Ability to Communicate:
3. CEFR level:
4. Key strengths`
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      console.log('3. OpenAI analysis complete:', data);
      return data;
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      return {
        analysis: 'Error analyzing speech. Please try again.'
      };
    }
  };

  const handleRecordingComplete = async (transcription: string, audioBlob: Blob) => {
    try {
      setIsLoading(true);
      console.log('1. Got transcription:', transcription);

      // Run both analyses in parallel
      const [openAIResult, speechAceResult] = await Promise.all([
        // OpenAI Analysis
        analyzeWithOpenAI(transcription),

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

  const handleVideoRef = (el: HTMLVideoElement | null) => {
    setVideoRef(el);
    if (el && initialLoadRef.current) {
      initialLoadRef.current = false;  // Mark initial load as complete
      el.muted = false;
      el.play()
        .then(() => {
          setVideoStarted(true);  // Successfully started with sound
        })
        .catch(e => {
          console.log('Video autoplay with sound failed:', e);
          el.muted = true;  // Fall back to muted
          el.play().catch(e => console.log('Muted autoplay also failed:', e));
        });
    }
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play().catch(e => console.log('Video play failed:', e));
      setVideoStarted(true);
    }
  };

  const handleSubmit = async () => {
    if (!audioUrl) return;
    
    setIsLoading(true);
    try {
      // Convert audio URL back to blob
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      
      // Convert to base64 for transcription
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Get transcription
      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });

      const data = await transcriptionResponse.json();
      if (!transcriptionResponse.ok) throw new Error(`Error: ${data.error}`);
      if (!data.transcription) throw new Error(`No transcription in response`);

      // Process with both APIs
      await handleRecordingComplete(data.transcription, audioBlob);

    } catch (error) {
      console.error('Submission error:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReRecord = () => {
    setShowReviewStep(false);
    setAudioUrl(null);
    // Reset any other necessary state
    setTimeLeft(45);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          {pageTitle}
        </h1>
        
        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/OpinionPage2.mp4"
            playsInline
            autoPlay
            controls
            className="rounded-lg mb-8"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {!videoStarted && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4 mb-8"
            >
              <span>▶️</span> Play Video With Sound
            </button>
          )}

          <div className="space-y-4 w-full max-w-2xl">
            <h3 className="text-2xl font-semibold text-center mb-2 text-gray-800">
              Do you prefer working at home or at the office? Provide 2 examples.
            </h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-lg text-gray-500 text-center">
                Record your answer for 35 to 45 seconds.
              </div>

              <button 
                onClick={() => setShowFrenchInstructions(!showFrenchInstructions)}
                className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-2 pb-10"
              >
                {showFrenchInstructions ? 'Masquer' : 'Afficher'} les instructions en français
                <span className="w-6 h-4 inline-flex items-center">
                  🇫🇷
                </span>
              </button>

              {showFrenchInstructions && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 animate-fadeIn mb-10">
                  <p className="space-y-2">
                    <span className="block font-semibold mb-2">Instructions en français:</span>
                    La première partie évalue vos compétences en expression orale en anglais.
                    <br /><br />
                    Votre tâche est de parler pendant 45 secondes. La question est : Préférez-vous travailler à la maison ou au bureau ? Essayez de donner 2 exemples pour appuyer votre opinion.
                    <br /><br />
                    Prenez un moment pour réfléchir, et quand vous êtes prêt(e), commencez votre enregistrement. Pendant que vous parlez, utilisez le plan à l'écran pour vous aider à structurer vos pensées. Une bonne façon de commencer est par "À mon avis..."
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            {!showReviewStep ? (
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
                {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Record your Answer'}
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {audioUrl && <audio controls src={audioUrl} className="mb-4" />}
                <div className="text-gray-700 text-center mb-4">
                  <p className="mb-2">1. Listen to your recording and if you are content with it, select Submit.</p>
                  <p>2. If you want to record it again, select Re-Record. Then Submit. You can only Re-record once.</p>
                </div>

                <button 
                  onClick={() => setShowReviewInstructions(!showReviewInstructions)}
                  className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-2 pb-6"
                >
                  {showReviewInstructions ? 'Masquer' : 'Afficher'} les instructions en français
                  <span className="w-6 h-4 inline-flex items-center">
                    🇫🇷
                  </span>
                </button>

                {showReviewInstructions && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 animate-fadeIn mb-6">
                    <p>1. Écoutez votre enregistrement et si vous en êtes satisfait(e), sélectionnez Soumettre.</p>
                    <p>2. Si vous souhaitez l'enregistrer à nouveau, sélectionnez Ré-enregistrer. Puis Soumettre. Vous ne pouvez ré-enregistrer qu'une seule fois.</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={handleReRecord}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full"
                  >
                    Re-Record Answer
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full"
                  >
                    {isLoading ? 'Processing...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="text-center mb-4 text-xl font-semibold">
                Time remaining: {timeLeft}s
              </div>
            )}

            {isLoading && (
              <p className="text-gray-600 text-center mt-2">
                Processing audio... This may take a few moments.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}