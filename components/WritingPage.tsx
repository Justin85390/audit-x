'use client';

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../app/contexts/LanguageContext';
import { Language } from '@/types';

interface LanguageContent {
  en: {
    title: string;
    subtitle: string;
    emailTo: string;
    emailSubject: string;
    emailPlaceholder: string;
    submitButton: string;
    processingButton: string;
    videoButton: string;
    guidelines: {
      title: string;
      structure: {
        title: string;
        points: string[];
      };
      tips: {
        title: string;
        points: string[];
      };
    };
  }
}

interface WritingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

export default function WritingPage({ onNext, updateUserData, onLanguageChange }: WritingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [writingText, setWritingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/WritingPage2.mp4"
  };

  const languageContent: LanguageContent = {
    en: {
      title: "Writing Task",
      subtitle: "Write an email to Anna about the summit",
      emailTo: "To:",
      emailSubject: "Subject:",
      emailPlaceholder: "Write your email here...",
      submitButton: "Submit & Continue",
      processingButton: "Analyzing...",
      videoButton: "Play Video",
      guidelines: {
        title: "Helpful Notes for Writing Your Email:",
        structure: {
          title: "Structure:",
          points: [
            "Start with a greeting (Dear Anna,)",
            "Introduce yourself and mention the summit",
            "State your suggestion clearly",
            "Explain why this would be helpful",
            "End with a polite closing"
          ]
        },
        tips: {
          title: "Remember to:",
          points: [
            "Be specific with your suggestion",
            "Give one clear reason",
            "Keep it brief (50-70 words)",
            "Use polite language",
            "Check your spelling and punctuation"
          ]
        }
      }
    }
  };

  const analyzeWithOpenAI = async (text: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Analysis error: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!writingText.trim()) {
      alert('Please write something before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      // Get OpenAI Analysis
      console.log('Getting OpenAI analysis...');
      const openAIResponse = await analyzeWithOpenAI(writingText);
      console.log('OpenAI analysis received');

      // Save to Supabase
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No user email found');
      }

      console.log('Saving to Supabase...');
      const { error } = await supabase
        .from('users')
        .update({
          writing_submission: writingText,
          writing_openai_analysis: openAIResponse
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Supabase update successful');

      // Update local state
      updateUserData('writingData', {
        text: writingText,
        analysis: openAIResponse,
        timestamp: new Date().toISOString()
      });
      console.log('Local state updated');

      // Brief delay to ensure user sees "Complete" state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to next page
      onNext();
    } catch (error) {
      console.error('Error in submission:', error);
      alert('Failed to submit writing sample. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setWritingText(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .catch(e => {
          console.error('Video play failed:', e);
          setAutoplayFailed(true);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          {languageContent.en.title}
        </h1>

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
          
          {autoplayFailed && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> {languageContent.en.videoButton}
            </button>
          )}
        </div>
      </div>

      {/* Writing Form Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {languageContent.en.subtitle}
        </h2>
        
        <div className="flex gap-6">
          {/* Email Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                    {languageContent.en.emailTo}
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
                    {languageContent.en.emailSubject}
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
                  <textarea
                    name="email"
                    rows={10}
                    value={writingText}
                    onChange={handleTextChange}
                    placeholder={languageContent.en.emailPlaceholder}
                    required
                    spellCheck="false"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className={`
                    bg-blue-500 hover:bg-blue-600 
                    text-white font-bold py-3 px-6 
                    rounded-full transition-colors duration-200 
                    min-w-[200px] 
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 
                    languageContent.en.processingButton : 
                    languageContent.en.submitButton
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Panel */}
          <div className="w-64 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">{languageContent.en.guidelines.title}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{languageContent.en.guidelines.structure.title}</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {languageContent.en.guidelines.structure.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">{languageContent.en.guidelines.tips.title}</h4>
                <ul className="space-y-1 text-sm">
                  {languageContent.en.guidelines.tips.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}