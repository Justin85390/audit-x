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
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const questions = [
    {
      question: "What is the main purpose of this listening?",
      options: [
        "To describe the various benefits of traveling for personal growth",
        "To show how traveling helps improve English skills",
        "To highlight different methods of learning English"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      points: 2
    },
    {
      question: "What opportunity does traveling to English-speaking countries provide?",
      options: [
        "The opportunity to access native English resources",
        "The chance to learn about cultural traditions",
        "The chance to practice real-life conversations"
      ],
      correctAnswer: 2,  // c is correct (index 2)
      points: 2
    },
    {
      question: "What specific example does Olivia give for experiencing culture?",
      options: [
        "Attending local cultural festivals",
        "Visiting museums and local markets",
        "Participating in community workshops"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      points: 2
    },
    {
      question: "Why is learning through travel more effective than textbooks?",
      options: [
        "Because travel exposes you to authentic language use in real contexts",
        "Because textbooks often lack examples of natural, conversational language",
        "Because teachers can't substitute real-world scenarios"
      ],
      correctAnswer: 0,  // a is correct (index 0)
      points: 2
    },
    {
      question: "What helps you understand the language better?",
      options: [
        "Studying grammar rules to build a strong foundation",
        "Experiencing the culture and its context",
        "Reading newspapers to expand vocabulary and comprehension"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      points: 2
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

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Listening Comprehension</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src="https://justindonlon.com/wp-content/uploads/2024/11/ListeningPage.mp4"
            controls
            playsInline
            className="rounded-lg"
            width="800"
            height="400"
          >
            Your browser does not support the video tag.
          </video>
          
          <button 
            onClick={handlePlayVideo}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
          >
            <span>▶️</span> Play Video
          </button>
        </div>
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