'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '../lib/supabase';

interface WritingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function WritingPage({ onNext, updateUserData }: WritingPageProps) {
  const videoId = "EHu1ROsxvwc";
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const initialLoadRef = useRef(true);
  const [showFrenchInstructions, setShowFrenchInstructions] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [writingText, setWritingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeWithOpenAI = async (text: string) => {
    console.log('Starting OpenAI analysis...');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      console.log('OpenAI analysis complete:', data);
      return data;
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      return {
        analysis: 'Error analyzing writing. Please try again.'
      };
    }
  };

  const handleSubmit = async () => {
    if (!writingText.trim()) {
      alert('Please write something before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('1. Starting analysis process...');
      
      // Get OpenAI Analysis
      const openAIResponse = await analyzeWithOpenAI(writingText);
      console.log('2. OpenAI analysis complete:', openAIResponse);

      // Save to Supabase with correct column names
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No user email found');
      }

      console.log('3. Saving to Supabase...');
      const { data, error } = await supabase
        .from('users')
        .update({
          writing_submission: writingText,
          writing_openai_analysis: openAIResponse.analysis
        })
        .eq('email', userEmail)
        .select();

      if (error) throw error;
      console.log('4. Save successful:', data);

      // Update user data in context/state
      updateUserData('writingData', {
        text: writingText,
        analysis: openAIResponse.analysis,
        timestamp: new Date().toISOString()
      });

      // Navigate to report page
      onNext();
    } catch (error) {
      console.error('Error in submission:', error);
      alert('Failed to submit writing sample. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setWritingText(text);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    await handleSubmit();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          Part 2: Writing
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/WritingPage2.mp4"
            playsInline
            autoPlay
            controls
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {!videoStarted && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> Play Video With Sound
            </button>
          )}
        </div>
      </div>

      {/* French Instructions Toggle */}
      <div className="w-full max-w-3xl flex justify-center items-center gap-2 mb-4">
        <button
          onClick={() => setShowFrenchInstructions(!showFrenchInstructions)}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
        >
          <span>Afficher les instructions en français</span>
          <img src="/fr-flag.png" alt="Français" width={24} height={18} className="rounded" />
        </button>
      </div>

      {/* French Instructions Panel */}
      {showFrenchInstructions && (
        <div className="w-full max-w-3xl bg-blue-50 rounded-lg p-6 mb-6">
          <p className="text-gray-800 leading-relaxed">
            Après avoir assisté au Sommet Mondial de l'Innovation à Singapour, j'ai une dernière tâche pour laquelle j'aimerais votre aide. En tant que participant(e) à notre conférence, j'apprécierais beaucoup avoir vos commentaires. Pourriez-vous m'envoyer un email avec une suggestion pour améliorer le sommet de l'année prochaine ? Cela peut concerner les présentations, les opportunités de réseautage ou les installations de la conférence. Veuillez envoyer votre suggestion par email à anna@linguaphone.fr. J'ai hâte de lire vos idées. Merci !
          </p>
        </div>
      )}

      {/* Form Container with Guidelines */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          Write Anna an email in the box below.
        </h2>
        
        <div className="flex gap-6">
          {/* Email Form */}
          <div className="flex-1">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                    To:
                  </label>
                  <input
                    type="text"
                    name="to"
                    id="to"
                    defaultValue="anna@linguaphone.fr"
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    defaultValue="Summit Feedback"
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email:
                  </label>
                  <textarea
                    name="email"
                    id="email"
                    rows={10}
                    placeholder="Write your email here..."
                    required
                    spellCheck="false"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleTextChange}
                    onPaste={(e) => {
                      e.preventDefault();
                      alert('Pasting is not allowed. Please write your response.');
                    }}
                  />
                  <div className="text-sm mt-2 text-gray-600">
                    Word count: {wordCount}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px] disabled:opacity-50"
                >
                  {isLoading ? 'Analyzing...' : 'Submit & Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Panel */}
          <div className="w-64 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Helpful Notes for Writing Your Email:</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Structure:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Start with a greeting (Dear Anna,)</li>
                  <li>Introduce yourself and mention the summit</li>
                  <li>State your suggestion clearly</li>
                  <li>Explain why this would be helpful</li>
                  <li>End with a polite closing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Remember to:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Be specific with your suggestion
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Give one clear reason
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Keep it brief (50-70 words)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Use polite language
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Check your spelling and punctuation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}