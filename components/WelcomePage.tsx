import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import InputField from './shared/InputField';

interface WelcomePageProps {
  onNext: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [oliverResponse, setOliverResponse] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [languageIndex, setLanguageIndex] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const translations = [
    { text: "Oliver speaks many languages. Ask him in your language", lang: "en" },
    { text: "Oliver habla varios idiomas. Pregúntale en tu idioma", lang: "es" },
    { text: "Oliver parle plusieurs langues. Posez-lui des questions dans votre langue", lang: "fr" },
    { text: "Oliver spricht viele Sprachen. Fragen Sie ihn in Ihrer Sprache", lang: "de" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLanguageIndex((current) => (current + 1) % translations.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const startRecording = async () => {
    console.log("Starting recording for Oliver...");
    if (mediaRecorderRef.current?.state === "recording") {
      console.error("Another recording is already in progress.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("Stopping recording for Oliver...");
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsRecording(false);

        // Send audioBlob to Google Cloud API for transcription
        await sendToGoogleCloudOliver(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsRecording(false);
      alert('An error occurred while accessing the microphone. Please check your browser settings.');
    }
  };

  const stopRecording = () => {
    if (isRecording && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      console.error("No active Oliver recording found to stop.");
      alert('No active Oliver recording found to stop.');
    }
  };

  const handleToggleRecording = async () => {
    console.log("toggleRecordingOliver function called");
    try {
      if (isRecording) {
        setIsLoading(true);
        stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Recording error:', error);
      setIsLoading(false);
    }
  };

  const sendToGoogleCloudOliver = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      // Convert Blob to base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });

      console.log("Audio data type:", typeof base64Data);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Data || ''
        })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error details:", errorData);
        throw new Error(`Server error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("Transcription result:", data);
      
      if (data.response) {
        setOliverResponse(data.response);
        
        // Play audio if available
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          await audio.play();
        }
      }

      return data.transcription;
    } catch (error) {
      console.error('Detailed transcription error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTypedQuestion = async () => {
    try {
      setIsLoading(true);
      console.log("Sending typed question:", userQuestion);
      setUserTranscript(userQuestion);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userQuestion,
          isTyped: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process question');
      }

      console.log("Server response:", data);
      setOliverResponse(data.response);

      // Play audio if available
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }

      // Clear the input after sending
      setUserQuestion('');

    } catch (error) {
      console.error('Error sending typed question:', error);
      setOliverResponse(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async () => {
    const question = "Tell me about the language audit";
    setUserQuestion(question);
    setUserTranscript(question);
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: question,
          isTyped: true
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process question');
      }

      setOliverResponse(data.response);
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('Error:', error);
      setOliverResponse(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      setUserQuestion('');
    }
  };

  const sendToOpenAI = async (transcription: string) => {
    try {
      // Send to /api/transcribe for voice response
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcription,
          isTyped: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setOliverResponse(data.response);

      // Play audio if available
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('OpenAI error:', error);
      setOliverResponse(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.play();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      {/* Title Section */}
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Linguaphone</h1>

      {/* Video Section - with matching container styling */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="w-full flex justify-center mb-6">
          <video 
            ref={(el) => setVideoRef(el)}
            width="800"
            height="400"
            controls
            playsInline
            className="rounded-lg"
          >
            <source src="https://justindonlon.com/wp-content/uploads/2024/11/Welcome-Page.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <button 
          onClick={handlePlayVideo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mb-4"
        >
          <span>▶️</span> Play Video
        </button>
        
        <p className="text-lg mb-4 text-center text-gray-600">
          Your journey starts with just a few questions. Press &quot;Ready&quot; to begin.
        </p>

        <div className="flex justify-center">
          <button 
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full"
          >
            Ready
          </button>
        </div>
      </div>

      {/* Oliver Section - Outer Box (already has matching styling) */}
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
          <div>
            <h2 className="text-2xl font-bold">Oliver</h2>
            <h3 className="text-xl text-gray-600">Your Audit Assistant</h3>
            <h4 className="text-sm text-gray-500 mt-2">
              Type in the box below or ask me a question with "Ask Oliver"
            </h4>
            <p className="text-sm mt-2 bg-yellow-50 px-3 py-1 rounded-lg inline-block transition-opacity duration-500">
              {translations[languageIndex].text}
            </p>
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
                placeholder="Type your question for Oliver..."
                className="flex-grow"
              />
              {userQuestion && (
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full"
                  onClick={handleSendTypedQuestion}
                >
                  Send
                </button>
              )}
            </div>
            
            {/* Suggestion Bubble */}
            <button 
              onClick={handleSuggestionClick}
              className="self-start px-4 py-2 my-4 bg-yellow-50 hover:bg-yellow-100 
                rounded-2xl text-gray-600 text-sm transition-colors duration-200 
                flex items-center gap-2 shadow-sm border border-yellow-100"
            >
              💭 Ask about the audit
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
            {oliverResponse || 'Hello! How can I help you today?'}
          </div>
        </div>

        {/* Voice Recording Button - centered container */}
        <div className="flex flex-col items-center mt-6">
          <div className="flex items-center justify-center space-x-4 w-full">
            <button
              onClick={handleToggleRecording}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2"
              disabled={isLoading}
            >
              {isRecording ? (
                <>
                  <span className="animate-pulse">⏺</span>
                  Stop
                </>
              ) : (
                <>
                  <span>🎤</span>
                  Ask Oliver
                </>
              )}
            </button>

            {isLoading && (
              <div className="text-gray-600 flex items-center ml-4 whitespace-nowrap">
                <span>Thinking</span>
                <span className="inline-block animate-bounce ml-1">.</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
