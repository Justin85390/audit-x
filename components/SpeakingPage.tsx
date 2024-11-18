import { useState, useRef } from 'react';

interface SpeakingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function SpeakingPage({ onNext, updateUserData }: SpeakingPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoId = "DXQzd0REkXY";

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
          // Convert blob to base64
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
              audio: base64Audio
            })
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const data = await response.json();

          // Store both audio and transcription
          updateUserData('speakingData', {
            audioBlob,
            transcription: data.transcription,
            timestamp: new Date().toISOString()
          });

          onNext(); // Move to next page after successful transcription

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

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert audio to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Get transcription only
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Just store transcription and move on
      updateUserData('speakingData', {
        transcription: data.transcription,
        timestamp: new Date().toISOString()
      });
      
      onNext();
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Let's Talk</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full flex justify-center">
          <iframe
            width="800"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Speaking Assessment Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
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
    </div>
  );
}