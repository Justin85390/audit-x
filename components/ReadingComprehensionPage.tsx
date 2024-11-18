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
      question: "What is the main purpose of this text?",
      options: [
        "To describe London's history",
        "To give advice for visiting London",
        "To compare London with other cities"
      ],
      correctAnswer: 1,  // B is correct (index 1)
      points: 2
    },
    {
      question: "According to the text, what is the best way to travel around London?",
      options: [
        "By walking everywhere",
        "By taking taxis",
        "By using the Underground"
      ],
      correctAnswer: 2,  // C is correct (index 2)
      points: 2
    },
    {
      question: "What does the text recommend for paying transport fares?",
      options: [
        "Using cash only",
        "An Oyster card or contactless bank card",
        "Buying single tickets each time"
      ],
      correctAnswer: 1,  // B is correct (index 1)
      points: 2
    },
    {
      question: "Why does the text suggest starting your day early?",
      options: [
        "Because the weather is better in the morning",
        "Because the attractions are cheaper",
        "Because there are fewer people around"
      ],
      correctAnswer: 2,  // C is correct (index 2)
      points: 2
    },
    {
      question: "What specific food recommendation does the text make?",
      options: [
        "Fish and chips",
        "Traditional tea",
        "Local sandwiches"
      ],
      correctAnswer: 0,  // A is correct (index 0)
      points: 2
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
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Reading Comprehension</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full flex justify-center">
          <iframe
            width="800"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Reading Comprehension Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Reading Text Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Read the following text:</h2>
        <p className="text-gray-700 leading-relaxed">
          {readingText}
        </p>
      </div>
      
      {/* Question Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full max-w-2xl mx-auto">
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
  );
}