'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ReadingComprehensionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function ReadingComprehensionPage({ onNext, updateUserData }: ReadingComprehensionPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const videoId = "fIPPqgLpe0M";
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const initialLoadRef = useRef(true);

  const readingText = `The World Innovation Summit brings together experts from over 50 countries each year in Singapore. This important three-day event features keynote speeches, workshops, and networking opportunities. Participants should register early as spaces fill up quickly. The conference center provides translation services in five languages, and all presentations are recorded for later viewing. There's a welcome dinner on the first evening where attendees can meet informally. Don't forget to bring business cards and download the conference app to plan your schedule!`;

  const questions = [
    {
      question: "What is the main purpose of this text?",
      options: [
        "To explain how conferences work",
        "To provide information about attending the summit",
        "To describe Singapore's business culture"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "main_idea"
    },
    {
      question: "According to the text, how long does the event last?",
      options: [
        "Multiple days",
        "Three days",
        "A work week"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "What services does the conference provide?",
      options: [
        "General language support",
        "Translation in five languages",
        "International calling facilities"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "What happens on the first evening?",
      options: [
        "A social event",
        "A welcome dinner",
        "Opening presentations"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "Based on the text, why should participants register early?",
      options: [
        "Because the event is popular",
        "Because spaces are limited and fill quickly",
        "Because early registration is cheaper"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "inference"
    },
    {
      question: "Why does the text mention the conference app?",
      options: [
        "For general information access",
        "To help organize your conference schedule",
        "To connect with other attendees"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "inference"
    }
  ];

  // Add states for accordion and answers
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | null }>({});

  // Add state for instructions
  const [showInstructions, setShowInstructions] = useState(false);

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions(current =>
      current.includes(questionIndex)
        ? current.filter(i => i !== questionIndex)
        : [...current, questionIndex]
    );
  };

  const handleAnswerSelect = (questionIndex: number, answer: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    // Calculate final score
    let finalScore = 0;
    let correctCount = 0;

    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        finalScore += question.points;
        correctCount++;
      } else if (selectedAnswer === question.partialCredit) {
        finalScore += question.points / 2;
      }
    });

    const totalPossiblePoints = questions.reduce((total, q) => total + q.points, 0);
    const percentageScore = Math.round((finalScore / totalPossiblePoints) * 100);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      // Save to Supabase
      console.log('Saving reading score to database:', percentageScore);
      const { data, error } = await supabase
        .from('users')
        .update({
          reading_score: percentageScore
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Reading score saved successfully');

      // Update local state
      updateUserData('readingScore', percentageScore);
      updateUserData('readingCorrectAnswers', correctCount);
      updateUserData('readingAssessment', {
        totalScore: percentageScore,
        correctAnswers: correctCount,
        possibleScore: totalPossiblePoints,
        percentageScore,
        cefrLevel: getCefrLevel(percentageScore),
        timestamp: new Date().toISOString()
      });

      onNext();
    } catch (error) {
      console.error('Error saving reading score:', error);
    }
  };

  const getCefrLevel = (score: number): string => {
    if (score >= 90) return 'C1-C2';
    if (score >= 70) return 'B2';
    if (score >= 50) return 'B1';
    if (score >= 30) return 'A2';
    return 'A1';
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

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          Part 2: Reading
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/Reading2.mp4"
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

          {/* French Instructions Toggle */}
          <div className="w-full flex flex-col items-center mb-6 mt-4">
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-2"
            >
              {showInstructions ? 'Masquer' : 'Afficher'} les instructions en français
              <span className="w-6 h-4 inline-flex items-center">
                🇷
              </span>
            </button>

            {showInstructions && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 animate-fadeIn mt-4">
                <p>
                  Ensuite, pour l'évaluation de lecture, le texte ci-dessous porte sur une conférence internationale. 
                  Prenez le temps de lire le texte, puis répondez aux 6 questions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Text Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Read the following text:</h2>
        <p className="text-gray-700 leading-relaxed">
          {readingText}
        </p>
      </div>
      
      {/* Questions Accordion */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleQuestion(questionIndex)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold">Question {questionIndex + 1}</span>
                <span className="text-xl">
                  {expandedQuestions.includes(questionIndex) ? '−' : '+'}
                </span>
              </button>

              {expandedQuestions.includes(questionIndex) && (
                <div className="p-4 space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    {question.question}
                  </h3>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-start space-x-3 p-3 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          checked={selectedAnswers[questionIndex] === optionIndex}
                          onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                          className="mt-1"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className={`
              px-6 py-3 rounded-full font-bold text-white
              ${Object.keys(selectedAnswers).length < questions.length
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            Submit & Continue
          </button>
        </div>
      </div>
    </div>
  );
}