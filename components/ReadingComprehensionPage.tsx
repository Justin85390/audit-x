'use client';

import { useState } from 'react';

interface ReadingComprehensionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function ReadingComprehensionPage({ onNext, updateUserData }: ReadingComprehensionPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const videoId = "fIPPqgLpe0M";

  const readingText = `London is a big and exciting city with many famous places to see. To enjoy your visit, plan your day carefully. Use the Underground (the "Tube") to travel quickly around the city. It is a good idea to buy an Oyster card or use a contactless bank card for cheaper fares. Remember, London can be busy, so start your day early to avoid crowds. Always check the weather because it can change often, and carry a small umbrella just in case. Lastly, try some local food like fish and chips to make your trip special!`;

  const questions = [
    {
      question: "What is a good way to travel quickly around London?",
      options: [
        "By car",
        "By bus",
        "By Underground"
      ],
      correctAnswer: 2, // C is index 2
      points: 3
    },
    {
      question: "Why should you check the weather in London?",
      options: [
        "The weather changes often",
        "It is always sunny",
        "It is always raining"
      ],
      correctAnswer: 0, // A is index 0
      points: 3.5
    },
    {
      question: "What is a good way to save money on travel fares in London?",
      options: [
        "Buy a paper ticket",
        "Use an Oyster card or contactless bank card",
        "Pay in cash"
      ],
      correctAnswer: 1, // B is index 1
      points: 3.5
    }
  ];

  const handleAnswerSelect = (selectedIndex: number) => {
    const currentQ = questions[currentQuestion];
    
    if (selectedIndex === currentQ.correctAnswer) {
      setScore(prev => prev + currentQ.points);
      setCorrectAnswers(prev => prev + 1);
    }

    if (currentQuestion === questions.length - 1) {
      updateUserData('readingScore', score + (selectedIndex === currentQ.correctAnswer ? currentQ.points : 0));
      updateUserData('readingCorrectAnswers', correctAnswers + (selectedIndex === currentQ.correctAnswer ? 1 : 0));
      onNext();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Travel Tips for London</h1>
        
        <div className="flex flex-col items-center space-y-8">
          {/* Video Container */}
          <div className="w-full flex justify-center">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Reading Text Container */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Read the following text:</h2>
            <p className="text-gray-700 leading-relaxed">
              {readingText}
            </p>
          </div>
          
          {/* Question Container */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6">
              {questions[currentQuestion].question}
            </h3>
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="w-full text-left p-4 rounded border hover:bg-gray-50 
                           transition-colors duration-200 focus:outline-none 
                           focus:ring-2 focus:ring-blue-500"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}