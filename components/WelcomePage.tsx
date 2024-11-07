import React, { useState, useRef } from 'react';
import Image from 'next/image';
import InputField from './shared/InputField';

interface WelcomePageProps {
  onNext: () => void;
}

export default function WelcomePage({ onNext }: WelcomePageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [oliviaResponse, setOliviaResponse] = useState<string>('');
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [userQuestion, setUserQuestion] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    console.log("Starting recording for Olivia...");
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
        console.log("Stopping recording for Olivia...");
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsRecording(false);

        // Send audioBlob to Google Cloud API for transcription
        await sendToGoogleCloudOlivia(audioBlob);
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
      console.error("No active Olivia recording found to stop.");
      alert('No active Olivia recording found to stop.');
    }
  };

  const handleToggleRecording = async () => {
    console.log("toggleRecordingOlivia function called");
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const sendToGoogleCloudOlivia = async (audioBlob: Blob) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY;
    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

    try {
      console.log("Sending audio to server...");
      
      // Convert audio to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64data = result.split(',')[1];
          resolve(base64data);
        };
        reader.readAsDataURL(audioBlob);
      });

      const requestPayload = {
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: "en-US"
        },
        audio: {
          content: base64Audio
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`Google Cloud returned an error: ${response.status}`);
      }

      const data = await response.json();
      if (data?.results?.[0]?.alternatives?.[0]?.transcript) {
        const transcription = data.results[0].alternatives[0].transcript;
        console.log("Transcription:", transcription);
        setUserTranscript(transcription);
        
        // Send to OpenAI for response
        await sendToOpenAI(transcription);
      } else {
        throw new Error('No transcription found in the response');
      }

    } catch (error) {
      console.error('Detailed error:', error);
      setOliviaResponse(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleSendTypedQuestion = async () => {
    try {
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
      setOliviaResponse(data.response);

      // Play audio if available
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }

      // Clear the input after sending
      setUserQuestion('');

    } catch (error) {
      console.error('Error sending typed question:', error);
      setOliviaResponse(error instanceof Error ? error.message : 'An unknown error occurred');
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
      setOliviaResponse(data.response);

      // Play audio if available
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('OpenAI error:', error);
      setOliviaResponse(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      {/* Title Section */}
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome to Linguaphone</h1>
      <p className="text-lg mb-8 text-center text-gray-600">
        Your journey starts with just a few questions. Press "Ready" to begin.
      </p>
      
      {/* Centered Image */}
      <div className="w-full max-w-2xl mb-4 flex justify-center">
        <Image
          src="https://justindonlon.com/wp-content/uploads/2024/10/UK-home-page-.png"
          alt="Image of London Bridge"
          width={800}
          height={400}
          className="rounded-lg w-auto h-auto"
          priority
        />
      </div>

      {/* Ready Button */}
      <button 
        onClick={onNext}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full mb-8"
      >
        Ready
      </button>

      {/* Olivia Section - Outer Box */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Olivia Header */}
        <div className="flex items-center mb-6">
          <div className="w-24 flex-shrink-0 mr-6">
            <Image
              src="/avatar.png"
              alt="Olivia Avatar"
              width={96}
              height={96}
              className="rounded-full border-4 border-gray-200"
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Olivia</h2>
            <h3 className="text-xl text-gray-600">Your Learning Assistant</h3>
            <h4 className="text-sm text-gray-500 mt-2">
              Type in the box below or ask me a question with "Ask Olivia"
            </h4>
          </div>
        </div>

        {/* Inner Box for Interaction */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          {/* Text Input with Send Button */}
          <div className="flex gap-2 mb-4">
            <InputField
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Type your question for Olivia..."
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

          {/* User's transcription */}
          {userTranscript && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">You said:</p>
              <p className="text-gray-800">{userTranscript}</p>
            </div>
          )}
          
          {/* Olivia's response */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {oliviaResponse || 'Hello! How can I help you today?'}
          </div>
        </div>

        {/* Voice Recording Button */}
        <div className="flex justify-center">
          <button 
            className={`${
              isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
            } text-white font-bold py-2 px-6 rounded-full`}
            onClick={handleToggleRecording}
          >
            {isRecording ? 'Stop Recording' : 'Ask Olivia'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to send audio to Google Cloud (implement this based on your API setup)
async function sendToGoogleCloudOlivia(audioBlob: Blob) {
  // Implement your Google Cloud API call here
  console.log('Sending audio to Google Cloud...');
}