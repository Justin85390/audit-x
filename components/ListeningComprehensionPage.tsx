'use client';

import { useState, useRef } from "react"

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

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
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

  const handleSubmit = () => {
    let totalScore = 0;
    let correctAnswers = 0;
    let questionBreakdown: { [key: string]: number } = {
      main_idea: 0,
      specific_detail: 0,
      inference: 0
    };

    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer !== null) {
        const points = getPartialCredit(question.type, selectedAnswer, index);
        totalScore += points;
        
        if (points === 2) {
          correctAnswers += 1;
          questionBreakdown[question.type] += 1;
        } else if (points === 1) {
          questionBreakdown[question.type] += 0.5; // Count partial credit as half correct
        }
      }
    });

    const cefrLevel = getCEFRLevel(totalScore);
    const percentageScore = (totalScore / (questions.length * 2)) * 100;

    // Prepare detailed assessment data
    const assessmentData = {
      totalScore,
      correctAnswers,
      possibleScore: questions.length * 2,
      percentageScore,
      cefrLevel,
      questionBreakdown,
      breakdown: {
        mainIdea: (questionBreakdown.main_idea / 1) * 100, // 1 main idea question
        specificDetails: (questionBreakdown.specific_detail / 3) * 100, // 3 specific detail questions
        inference: (questionBreakdown.inference / 2) * 100, // 2 inference questions
      },
      qualitativeAnalysis: {
        strengths: [] as string[],
        areasForImprovement: [] as string[]
      }
    };

    // Add qualitative analysis
    if (assessmentData.breakdown.mainIdea >= 100) {
      assessmentData.qualitativeAnalysis.strengths.push("Strong grasp of main ideas");
    } else {
      assessmentData.qualitativeAnalysis.areasForImprovement.push("Work on identifying main themes");
    }

    if (assessmentData.breakdown.specificDetails >= 75) {
      assessmentData.qualitativeAnalysis.strengths.push("Good attention to detail");
    } else {
      assessmentData.qualitativeAnalysis.areasForImprovement.push("Practice active listening for specific information");
    }

    if (assessmentData.breakdown.inference >= 75) {
      assessmentData.qualitativeAnalysis.strengths.push("Strong inferential understanding");
    } else {
      assessmentData.qualitativeAnalysis.areasForImprovement.push("Work on drawing conclusions from context");
    }

    // Update user data with comprehensive assessment
    updateUserData('listeningScore', totalScore);
    updateUserData('listeningCorrectAnswers', correctAnswers);
    updateUserData('listeningAssessment', assessmentData);
    
    onNext();
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
            🇫🇷
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