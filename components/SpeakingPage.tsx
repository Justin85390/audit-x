'use client';

import { useState, useRef, useEffect } from 'react';
import { OLIVER_SPEAKING_ASSESSMENT, TranscriptItem, SpeakingAssessmentData, constructOliverResponse } from '@/app/lib/oliver-instructions';
import Image from 'next/image';

interface SpeakingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
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

export default function SpeakingPage({ onNext, updateUserData }: SpeakingPageProps) {
  // Combined states
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOliverRecording, setIsOliverRecording] = useState(false);
  const [isOliverSpeaking, setIsOliverSpeaking] = useState(false);
  
  // Response and transcription states
  const [showOliver, setShowOliver] = useState(false);
  const [oliverResponse, setOliverResponse] = useState('');
  const [userTranscription, setUserTranscription] = useState<string>('');
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Add state for tracking questions and transcripts
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptItem[]>([]);

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

          // If this is the first interaction
          if (!transcriptHistory.length) {
            // First add user's transcription to history
            const newTranscript: TranscriptItem = {
              speaker: 'user',
              text: userTranscription,
              timestamp: new Date().toISOString()
            };
            
            setTranscriptHistory(prev => [...prev, newTranscript]);

            const initialResponse = constructOliverResponse(userTranscription);
            setOliverResponse(initialResponse);
            
            // Extract focus areas from the user's response
            const extractFocusAreas = (response: string) => {
              const focusKeywords = ['grammar', 'vocabulary', 'pronunciation', 'speaking', 'listening', 'writing', 'reading', 'modal verbs', 'tenses', 'articles', 'prepositions'];
              const responseLower = response.toLowerCase();
              return focusKeywords.filter(keyword => responseLower.includes(keyword));
            };

            // Store the speaking assessment data
            updateUserData('speakingData', {
              initialResponse: userTranscription,
              oliverFeedback: initialResponse,
              focusAreas: extractFocusAreas(userTranscription),
              transcriptHistory: [{
                speaker: 'user',
                text: userTranscription,
                timestamp: new Date().toISOString()
              }, {
                speaker: 'oliver',
                text: initialResponse,
                timestamp: new Date().toISOString()
              }],
              timestamp: new Date().toISOString()
            });

            // Make API call with forceResponse
            const oliverResponse = await fetch('/api/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-page-type': 'speaking'
              },
              body: JSON.stringify({
                text: initialResponse,
                isTyped: true,
                context: OLIVER_SPEAKING_ASSESSMENT.context,
                forceResponse: initialResponse
              })
            });

            if (oliverResponse.ok) {
              const oliverData = await oliverResponse.json();
              
              // Play the audio using the complete response
              if (oliverData.audioUrl) {
                const audio = new Audio(oliverData.audioUrl);
                setIsOliverSpeaking(true);
                await audio.play();
                audio.onended = () => {
                  setIsOliverSpeaking(false);
                };
              }

              // Add Oliver's response to transcript history
              setTranscriptHistory(prev => [...prev, {
                speaker: 'oliver',
                text: initialResponse,
                timestamp: new Date().toISOString()
              } as TranscriptItem]);
            }
          } 
          // Handle the second interaction and final response
          else if (transcriptHistory.length === 2) {
            // Add user's second response to history
            setTranscriptHistory(prev => [...prev, {
              speaker: 'user',
              text: userTranscription,
              timestamp: new Date().toISOString()
            } as TranscriptItem]);

            // Final thank you response
            const finalResponse = OLIVER_SPEAKING_ASSESSMENT.finalResponse;
            setOliverResponse(finalResponse);

            // Make API call for final response
            const oliverResponse = await fetch('/api/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-page-type': 'speaking'
              },
              body: JSON.stringify({
                text: finalResponse,
                isTyped: true,
                context: OLIVER_SPEAKING_ASSESSMENT.context,
                forceResponse: finalResponse
              })
            });

            if (oliverResponse.ok) {
              const oliverData = await oliverResponse.json();
              
              if (oliverData.audioUrl) {
                const audio = new Audio(oliverData.audioUrl);
                setIsOliverSpeaking(true);
                await audio.play();
                audio.onended = () => {
                  setIsOliverSpeaking(false);
                };
              }

              // Add final response to transcript history
              setTranscriptHistory(prev => [...prev, {
                speaker: 'oliver',
                text: finalResponse,
                timestamp: new Date().toISOString()
              } as TranscriptItem]);
            }
          }

          // Store complete interaction data
          updateUserData('speakingData', {
            userResponse: userTranscription,
            timestamp: new Date().toISOString(),
            transcriptHistory: transcriptHistory
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

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Let's Talk</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src="https://justindonlon.com/wp-content/uploads/2024/11/Speaking-Page.mp4"
            controls
            playsInline
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          <button 
            onClick={handlePlayVideo}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
          >
            <span>▶️</span> Play Video
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-2 text-gray-800">
              What do you find most difficult with using English?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-8 italic">
              Common responses: grammar, listening comprehension, pronunciation, writing emails, understanding accents in business meetings
            </p>
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
                {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Record your Answer'}
              </button>

              {/* Loading message */}
              {isLoading && (
                <p className="text-gray-600 text-center mt-2">
                  Processing audio... This may take a few moments.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Oliver's Conversation Container */}
      <div className={`w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 transition-opacity duration-500 ${transcriptHistory.length ? 'opacity-100' : 'opacity-0'}`}>
        {/* Oliver's Image */}
        <div className="flex justify-center mb-4">
          <Image
            src="/oliveravatar.png"
            alt="Oliver"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>

        {/* Conversation Area */}
        <div className="h-64 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-4">
          {transcriptHistory.map((item, index) => (
            <div
              key={index}
              className={`mb-4 ${
                item.speaker === 'oliver' ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="font-semibold">
                {item.speaker === 'oliver' ? 'Oliver: ' : 'You: '}
              </span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Buttons Container */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleRecording}
            disabled={isLoading || isOliverSpeaking}
            className={`
              ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
              ${isLoading || isOliverSpeaking ? 'opacity-50 cursor-not-allowed' : ''}
              text-white font-bold py-2 px-6 rounded-full transition-colors
              flex items-center justify-center min-w-[200px]
            `}
          >
            {isLoading ? 'Thinking...' : isRecording ? 'Stop Recording' : 'Reply to Oliver'}
          </button>

          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full font-medium bg-green-500 hover:bg-green-600 text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}