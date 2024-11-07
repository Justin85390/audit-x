'use client';

import { useState } from "react"

interface ListeningComprehensionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function ListeningComprehensionPage({ onNext, updateUserData }: ListeningComprehensionPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const videoId = "vXmhR3Mmaqc";

  const questions = [
    {
      question: "What is one way that traveling can help improve your English?",
      options: [
        "You can practice conversations with native speakers",
        "You can study more grammar rules",
        "You can read more books in English"
      ],
      correctAnswer: 0,  // A is correct (index 0)
      points: 3
    },
    {
      question: "Why is experiencing the culture important when learning English?",
      options: [
        "It helps you understand the language better",
        "It teaches you how to cook local dishes",
        "It helps you remember vocabulary lists"
      ],
      correctAnswer: 0,  // A is correct (index 0)
      points: 3.5
    },
    {
      question: "According to the narrator, where can you hear everyday language while traveling?",
      options: [
        "In a library",
        "In museums or local markets",
        "In a quiet park"
      ],
      correctAnswer: 1,  // B is correct (index 1)
      points: 3.5
    }
  ];

  const handleAnswerSelect = (selectedIndex: number) => {
    const currentQ = questions[currentQuestion];
    
    // Check if answer is correct and update score
    if (selectedIndex === currentQ.correctAnswer) {
      setScore(prev => prev + currentQ.points);
      setCorrectAnswers(prev => prev + 1);
    }

    // If it's the last question, update userData and move to next page
    if (currentQuestion === questions.length - 1) {
      updateUserData('listeningScore', score + (selectedIndex === currentQ.correctAnswer ? currentQ.points : 0));
      updateUserData('listeningCorrectAnswers', correctAnswers + (selectedIndex === currentQ.correctAnswer ? 1 : 0));
      onNext();
    } else {
      // Move to next question
      setCurrentQuestion(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Listening Comprehension</h1>
        
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