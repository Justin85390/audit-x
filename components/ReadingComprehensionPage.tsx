'use client';

import { useState, useRef } from 'react';

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

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions(current =>
      current.includes(questionIndex)
        ? current.filter(i => i !== questionIndex)
        : [...current, questionIndex]
    );
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const getCEFRLevel = (score: number): string => {
    if (score >= 11) return 'C1';     // 92-100%
    if (score >= 9) return 'B2';      // 75-91%
    if (score >= 7) return 'B1';      // 58-74%
    if (score >= 5) return 'B1-A2';   // 42-57%
    if (score >= 3) return 'A2';      // 25-41%
    return 'A2-A1';                   // 0-24%
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

  const handleSubmit = () => {
    let newScore = 0;
    let correctCount = 0;

    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        newScore += question.points;
        correctCount++;
      } else if (selectedAnswer === question.partialCredit) {
        newScore += question.points / 2;
        correctCount += 0.5;
      }
    });

    // Update the score and correct answers
    setScore(newScore);
    setCorrectAnswers(correctCount);

    // Save the results
    updateUserData('readingScore', newScore);
    updateUserData('readingLevel', getCEFRLevel(newScore));
    updateUserData('readingCorrectAnswers', correctCount);

    // Move to next section
    onNext();
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