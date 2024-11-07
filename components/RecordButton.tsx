'use client';

import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";

interface RecordButtonProps {
  onRecordingComplete: (transcription: string) => void;
}

export default function RecordButton({ onRecordingComplete }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          // Convert audio to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const audioContent = base64Audio.split(',')[1];

            // Send to your existing Google Cloud Speech-to-Text API endpoint
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ audio: audioContent }),
            });

            if (!response.ok) throw new Error('Transcription failed');

            const { transcription } = await response.json();
            await onRecordingComplete(transcription);
            
            // Stop all tracks in the stream
            mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          };
        } catch (error) {
          console.error('Error processing recording:', error);
          alert('Error processing recording. Please try again.');
        }
      };
    }
    setIsRecording(false);
  };

  const handleClick = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      // Instead of router.push, use the onRecordingComplete prop
      onRecordingComplete(data.transcription);
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error processing your recording. Please try again.');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`px-6 py-3 font-semibold rounded-md transition-all ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {isRecording ? 'Stop Recording' : 'Record your Answer'}
    </Button>
  );
}