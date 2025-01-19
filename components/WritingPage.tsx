'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../app/contexts/LanguageContext';
import { Language } from '@/types';

interface LanguageContent {
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

interface WritingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

export default function WritingPage({ onNext, updateUserData, onLanguageChange }: WritingPageProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [writingText, setWritingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Video URLs
  const videoUrls = {
    en: "https://justindonlon.com/wp-content/uploads/2025/01/WritingPage2.mp4",
    fr: "https://justindonlon.com/wp-content/uploads/2025/01/FR-WritingPage2.mp4"
  };

  const languageContent: Record<Language, LanguageContent> = {
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
    },
    fr: {
      title: "Tâche d'Écriture",
      subtitle: "Écrivez un email à Anna à propos du sommet",
      emailTo: "À:",
      emailSubject: "Objet:",
      emailPlaceholder: "Écrivez votre email ici...",
      submitButton: "Soumettre & Continuer",
      processingButton: "Analyse en cours...",
      videoButton: "Lire la Vidéo",
      guidelines: {
        title: "Conseils Utiles pour Rédiger Votre Email:",
        structure: {
          title: "Structure:",
          points: [
            "Commencez par une salutation (Chère Anna,)",
            "Présentez-vous et mentionnez le sommet",
            "Énoncez clairement votre suggestion",
            "Expliquez pourquoi ce serait utile",
            "Terminez poliment"
          ]
        },
        tips: {
          title: "N'oubliez pas de:",
          points: [
            "Être précis dans votre suggestion",
            "Donner une raison claire",
            "Rester concis (50-70 mots)",
            "Utiliser un langage poli",
            "Vérifier l'orthographe et la ponctuation"
          ]
        }
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.play();
      } catch (error) {
        console.error('Error playing video:', error);
        setAutoplayFailed(true);
      }
    }
  }, [language]);

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
      const openAIResponse = await analyzeWithOpenAI(writingText);

      // Save to Supabase
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No user email found');
      }

      const { error } = await supabase
        .from('users')
        .update({
          writing_submission: writingText,
          writing_openai_analysis: openAIResponse
        })
        .eq('email', userEmail);

      if (error) throw error;

      // Update user data
      updateUserData('writingData', {
        text: writingText,
        analysis: openAIResponse,
        timestamp: new Date().toISOString()
      });

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
      videoRef.current.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          {languageContent[language].title}
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={videoRef}
            src={videoUrls[language]}
            playsInline
            autoPlay
            controls
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {autoplayFailed && (
            <button 
              onClick={handlePlayVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> {languageContent[language].videoButton}
            </button>
          )}
        </div>
      </div>

      {/* Writing Form Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {languageContent[language].subtitle}
        </h2>
        
        <div className="flex gap-6">
          {/* Email Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                    {languageContent[language].emailTo}
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
                    {languageContent[language].emailSubject}
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
                    placeholder={languageContent[language].emailPlaceholder}
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
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px] disabled:opacity-50"
                >
                  {isLoading ? languageContent[language].processingButton : languageContent[language].submitButton}
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Panel */}
          <div className="w-64 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">{languageContent[language].guidelines.title}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{languageContent[language].guidelines.structure.title}</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {languageContent[language].guidelines.structure.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">{languageContent[language].guidelines.tips.title}</h4>
                <ul className="space-y-1 text-sm">
                  {languageContent[language].guidelines.tips.points.map((point, index) => (
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