'use client';

import { useState, useRef } from "react"
import { supabase } from '@/lib/supabase';

interface ListeningComprehensionPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function ListeningComprehensionPage({ onNext, updateUserData }: ListeningComprehensionPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const initialLoadRef = useRef(true);
  const [hasSecondVideoPlayed, setHasSecondVideoPlayed] = useState(false);
  const secondVideoRef = useRef<HTMLVideoElement | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | null }>({});
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const correctAnswersList = [
    "answer1", // Replace with your actual correct answers
    "answer2",
    // ... rest of your answers
  ];
  const [isTestComplete, setIsTestComplete] = useState(false);

  const questions = [
    {
      question: "What is the main purpose of this listening?",
      options: [
        "To explain different ways to practice English while traveling",
        "To show how traveling helps improve English skills",
        "To compare learning English at home versus abroad"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "main_idea"
    },
    {
      question: "According to the listening, what opportunity does traveling to English-speaking countries provide?",
      options: [
        "The chance to learn new words and phrases",
        "The chance to practice real-life conversations",
        "The opportunity to meet English teachers"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "What specific example does the listening give for experiencing culture?",
      options: [
        "Talking with native speakers",
        "Visiting museums and local markets",
        "Taking guided tours"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "According to the listening, what helps you understand the language better?",
      options: [
        "Practicing with native speakers",
        "Experiencing the culture",
        "Learning new vocabulary"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "specific_detail"
    },
    {
      question: "Based on the listening, why might learning through travel be more effective than textbooks?",
      options: [
        "Because travel exposes you to authentic language use in real contexts",
        "Because you learn words you don't find in textbooks",
        "Because it provides more speaking practice"
      ],
      correctAnswer: 0,  // a is correct (index 0)
      partialCredit: 1,  // b is partial credit (index 1)
      points: 2,
      type: "inference"
    },
    {
      question: "Why does the listening suggest that visiting museums and local markets is important for language learning?",
      options: [
        "Because it combines language learning with cultural experiences",
        "Because you hear everyday language being used",
        "Because you can practice speaking with different people"
      ],
      correctAnswer: 1,  // b is correct (index 1)
      partialCredit: 0,  // a is partial credit (index 0)
      points: 2,
      type: "inference"
    }
  ];

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
      console.log('Saving listening score to database:', percentageScore);
      const { data, error } = await supabase
        .from('users')
        .update({
          listening_score: percentageScore
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Listening score saved successfully');

      // Update local state
      updateUserData('listeningScore', percentageScore);
      updateUserData('listeningCorrectAnswers', correctCount);
      updateUserData('listeningAssessment', {
        totalScore: percentageScore,
        correctAnswers: correctCount,
        possibleScore: totalPossiblePoints,
        percentageScore,
        cefrLevel: getCefrLevel(percentageScore),
        timestamp: new Date().toISOString()
      });

      onNext();
    } catch (error) {
      console.error('Error saving listening score:', error);
    }
  };

  const getCEFRLevel = (score: number): string => {
    if (score >= 11) return 'B2';
    if (score >= 9) return 'B1+';
    if (score >= 7) return 'B1';
    if (score >= 5) return 'A2-B1';
    if (score >= 3) return 'A2';
    return 'A1-A2';
  };

  const getPartialCredit = (questionType: string, selectedAnswer: number, questionIndex: number): number => {
    const question = questions[questionIndex];
    
    // If they selected the correct answer, no need to check for partial credit
    if (selectedAnswer === question.correctAnswer) {
      return 2;
    }
    
    // If they selected the partial credit answer, award 1 point
    if (selectedAnswer === question.partialCredit) {
      return 1;
    }
    
    // No points for other answers
    return 0;
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

  const handlePlaySecondVideo = () => {
    if (secondVideoRef.current && !hasSecondVideoPlayed) {
      secondVideoRef.current.play();
      setHasSecondVideoPlayed(true);
    }
  };

  const handleFinishTest = async (score: number) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      // Save to Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          listening_score: score
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Listening score saved:', score);

      // Continue with existing functionality
      onNext();
    } catch (error) {
      console.error('Error saving listening score:', error);
    }
  };

  const handleSubmitAnswers = async () => {
    // Calculate score based on answers
    const correctAnswers = userAnswers.filter((answer, index) => 
      answer === correctAnswersList[index]
    ).length;
    const totalScore = Math.round((correctAnswers / correctAnswersList.length) * 100);
    
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      // Save to Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          listening_score: totalScore
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Listening score saved to database:', totalScore);

      // Update local state
      updateUserData('listeningCorrectAnswers', correctAnswers);
      updateUserData('listeningAssessment', {
        totalScore,
        correctAnswers,
        possibleScore: correctAnswersList.length,
        percentageScore: totalScore,
        cefrLevel: getCefrLevel(totalScore),
        timestamp: new Date().toISOString()
      });

      onNext();
    } catch (error) {
      console.error('Error saving listening score:', error);
    }
  };

  const getCefrLevel = (score: number): string => {
    if (score >= 90) return 'C1-C2';
    if (score >= 70) return 'B2';
    if (score >= 50) return 'B1';
    if (score >= 30) return 'A2';
    return 'A1';
  };

  const handleQuestionSubmit = async (questionIndex: number, selectedAnswer: number) => {
    const question = questions[questionIndex];
    let points = 0;

    if (selectedAnswer === question.correctAnswer) {
      points = question.points;
    } else if (selectedAnswer === question.partialCredit) {
      points = question.points / 2;
    }

    // Update score
    const newScore = score + points;
    setScore(newScore);
    
    // Calculate total possible points
    const totalPossiblePoints = questions.reduce((total, q) => total + q.points, 0);
    
    // Calculate percentage score
    const percentageScore = Math.round((newScore / totalPossiblePoints) * 100);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      // Save to Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          listening_score: percentageScore
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Listening score saved to database:', percentageScore);

      // Update local state
      updateUserData('listeningScore', percentageScore);
      updateUserData('listeningCorrectAnswers', correctAnswers);
      updateUserData('listeningAssessment', {
        totalScore: percentageScore,
        correctAnswers,
        possibleScore: totalPossiblePoints,
        percentageScore,
        cefrLevel: getCefrLevel(percentageScore),
        timestamp: new Date().toISOString()
      });

      // If this was the last question
      if (questionIndex === questions.length - 1) {
        onNext();
      }
    } catch (error) {
      console.error('Error saving listening score:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* First Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          Part 2: Listening
        </h1>
        
        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/ListeningPage2A.mp4"
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
      <div className="w-full max-w-3xl flex flex-col items-center">
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-2 pb-6"
        >
          {showInstructions ? 'Masquer' : 'Afficher'} les instructions en français
          <span className="w-6 h-4 inline-flex items-center">
            🇷
          </span>
        </button>

        {showInstructions && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 animate-fadeIn mb-6">
            <p>
              Maintenant, passons à la partie Écoute. Je vais vous donner des informations utiles, 
              puis je vous poserai quelques questions pour vérifier votre compréhension. Ne vous 
              inquiétez pas, ce n'est pas trop difficile. Choisissez simplement la meilleure 
              réponse pour chaque question. Quand vous êtes prêt(e), lancez la vidéo ci-dessous. 
              La vidéo ne peut être visionnée qu'une seule fois.
            </p>
          </div>
        )}
      </div>

      {/* Second Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full flex flex-col items-center">
          <video
            ref={secondVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/ListeningPage2B.mp4"
            playsInline
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {!hasSecondVideoPlayed && (
            <button 
              onClick={handlePlaySecondVideo}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>▶️</span> Play Video
            </button>
          )}
        </div>
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