'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

interface WritingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function WritingPage({ onNext, updateUserData }: WritingPageProps) {
  const videoId = "EHu1ROsxvwc";
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const initialLoadRef = useRef(true);
  const [showFrenchInstructions, setShowFrenchInstructions] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const analyzeEmail = async (emailText: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Please analyze the following email using this specific scoring system. Assess strictly against these CEFR-aligned criteria.

Email Assessment Scoring Grid (20 points total)

Structure & Format (4 points):
- C2 (4 pts): Sophisticated structure with perfect paragraphing; seamlessly integrates all elements (greeting, context, suggestion, explanation, closing) in a natural flow
- C1 (3.5 pts): Well-structured with appropriate paragraphing; all elements present and logically organized
- B2 (3 pts): Good structure with clear paragraphing; all elements present but transitions may be mechanical
- B1 (2 pts): Basic structure; most elements present but organization may be inconsistent
- A2 (1 pt): Simple structure; basic elements only (greeting + message); limited organization
- A1 (0.5 pts): Minimal structure; may miss key elements like greeting or closing

Task Completion & Content (4 points):
- C2 (4 pts): Sophisticated suggestion with compelling rationale; anticipates and addresses potential concerns
- C1 (3.5 pts): Clear, detailed suggestion with well-developed supporting arguments
- B2 (3 pts): Clear suggestion with relevant supporting details
- B1 (2 pts): Basic suggestion with simple explanation
- A2 (1 pt): Simple or unclear suggestion with minimal explanation
- A1 (0.5 pts): Very basic or incomplete suggestion

Language Accuracy (4 points):
- C2 (4 pts): Sophisticated language; near-perfect grammar; effective use of complex structures
- C1 (3.5 pts): Advanced language; rare minor errors; good range of complex structures
- B2 (3 pts): Good control of grammar; some complex structures; occasional errors don't impede understanding
- B1 (2 pts): Basic grammar control; simple structures; errors may be frequent but meaning remains clear
- A2 (1 pt): Limited grammar control; frequent basic errors (articles, tenses, agreement)
- A1 (0.5 pts): Very limited grammar; meaning often unclear due to errors

Professional Tone & Register (4 points):
- C2 (4 pts): Sophisticated professional tone; nuanced expression of politeness
- C1 (3.5 pts): Consistently appropriate professional tone with varied expressions
- B2 (3 pts): Clear professional tone with standard polite expressions
- B1 (2 pts): Generally appropriate tone with basic polite expressions
- A2 (1 pt): Basic level of politeness; may be inconsistent or inappropriate at times
- A1 (0.5 pts): Very limited awareness of formal register

Word Count & Conciseness (4 points):
- C2 (4 pts): 50-70 words; precise and elegant expression
- C1 (3.5 pts): 50-70 words; clear and efficient expression
- B2 (3 pts): 45-75 words; good control of expression
- B1 (2 pts): 40-80 words OR some redundancy
- A2 (1 pt): <40 or >80 words OR significant redundancy
- A1 (0.5 pts): Far outside word limits OR very repetitive

Total Score CEFR Mapping:
18-20 points = C2
16-17.5 points = C1
13-15.5 points = B2
10-12.5 points = B1
5-9.5 points = A2
0-4.5 points = A1

Level Indicators:

C2 Level:
- Sophisticated expressions and complex structures
- Nuanced and precise vocabulary
- Natural flow with elegant transitions
- Perfect control of tone and register

C1 Level:
- Advanced vocabulary and expressions
- Consistent use of complex structures
- Strong organizational skills
- Minor errors only in sophisticated language

B2 Level:
- Good range of vocabulary
- Mix of complex and simple structures
- Clear organization
- Occasional errors in complex structures

B1 Level:
- Adequate vocabulary for task
- Mainly simple structures
- Basic organization
- Errors don't impede understanding

A2 Level:
- Basic vocabulary
- Simple sentence structures
- Limited organization
- Frequent basic errors

A1 Level:
- Very limited vocabulary
- Incomplete or fragmented structures
- Minimal organization
- Meaning often unclear

Please provide:
1. A detailed score for each category (out of 4), with specific examples from the text to justify each score
2. The total score (out of 20)
3. The corresponding CEFR level
4. Detailed feedback using this template:
"CEFR Level Assessment: [level]
Overall Score: [X/20]

Category Breakdown:
- Structure & Format: [score] - [specific examples]
- Task Completion: [score] - [specific examples]
- Language Accuracy: [score] - [specific examples]
- Professional Tone: [score] - [specific examples]
- Word Count & Conciseness: [score] - [specific examples]

Key Strengths:
1. [strength 1 with example]
2. [strength 2 with example]

Areas for Improvement:
1. [area 1 with example and specific suggestion]
2. [area 2 with example and specific suggestion]

Next Steps for Development:
[3 specific, level-appropriate suggestions for improvement]"

Email text to analyze:
${emailText}`,
          emailText: emailText
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await response.json();
      console.log('Raw API Response:', data);

      // Handle the specific object structure we're receiving
      if (data.analysis && typeof data.analysis === 'object') {
        const analysisText = data.analysis.text || JSON.stringify(data.analysis);
        console.log('Converted analysis text:', analysisText);
        return analysisText;
      }

      return String(data.analysis || 'Analysis completed');

    } catch (error) {
      console.error('Error analyzing email:', error);
      return 'Error analyzing email. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailText = formData.get('email') as string;

    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.textContent = 'Analyzing...';
    submitButton.disabled = true;

    try {
      // Get OpenAI analysis
      const analysisResult = await analyzeEmail(emailText);
      
      // Get user email
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      // Save to Supabase
      const { data, error } = await supabase
        .from('users')
        .update({
          writing_submission: emailText,
          writing_openai_analysis: analysisResult
        })
        .eq('email', userEmail);

      if (error) throw error;
      console.log('Writing data saved successfully');

      // Update local state
      const writingData = {
        submission: emailText,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      };
      
      updateUserData('writingData', writingData);
      onNext();
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error analyzing your email. Please try again.');
    } finally {
      submitButton.textContent = 'Submit & Continue';
      submitButton.disabled = false;
    }
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-center mb-6">
          Part 2: Writing
        </h1>

        <div className="w-full flex flex-col items-center">
          <video
            ref={handleVideoRef}
            src="https://justindonlon.com/wp-content/uploads/2025/01/WritingPage2.mp4"
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
      <div className="w-full max-w-3xl flex justify-center items-center gap-2 mb-4">
        <button
          onClick={() => setShowFrenchInstructions(!showFrenchInstructions)}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
        >
          <span>Afficher les instructions en français</span>
          <Image src="/fr-flag.png" alt="Français" width={24} height={18} className="rounded" />
        </button>
      </div>

      {/* French Instructions Panel */}
      {showFrenchInstructions && (
        <div className="w-full max-w-3xl bg-blue-50 rounded-lg p-6 mb-6">
          <p className="text-gray-800 leading-relaxed">
            Après avoir assisté au Sommet Mondial de l'Innovation à Singapour, j'ai une dernière tâche pour laquelle j'aimerais votre aide. En tant que participant(e) à notre conférence, j'apprécierais beaucoup avoir vos commentaires. Pourriez-vous m'envoyer un email avec une suggestion pour améliorer le sommet de l'année prochaine ? Cela peut concerner les présentations, les opportunités de réseautage ou les installations de la conférence. Veuillez envoyer votre suggestion par email à anna@linguaphone.fr. J'ai hâte de lire vos idées. Merci !
          </p>
        </div>
      )}

      {/* Form Container with Guidelines */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          Write Anna an email in the box below.
        </h2>
        
        <div className="flex gap-6">
          {/* Email Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                    To:
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
                    Subject:
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email:
                  </label>
                  <textarea
                    name="email"
                    id="email"
                    rows={10}
                    placeholder="Write your email here..."
                    required
                    spellCheck="false"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleTextChange}
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
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px]"
                >
                  Submit & Continue
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Panel */}
          <div className="w-64 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Helpful Notes for Writing Your Email:</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Structure:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Start with a greeting (Dear Anna,)</li>
                  <li>Introduce yourself and mention the summit</li>
                  <li>State your suggestion clearly</li>
                  <li>Explain why this would be helpful</li>
                  <li>End with a polite closing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Remember to:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Be specific with your suggestion
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Give one clear reason
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Keep it brief (50-70 words)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Use polite language
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Check your spelling and punctuation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}