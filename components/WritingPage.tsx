'use client';

import React, { useState } from 'react';

interface WritingPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function WritingPage({ onNext, updateUserData }: WritingPageProps) {
  const videoId = "EHu1ROsxvwc";
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const analyzeEmail = async (emailText: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Please analyze the following email written by a learner and assess their language proficiency on the CEFR scale (A1 to C2). Consider the grammar, vocabulary, sentence structure, and overall coherence of the text when determining their level. Provide an explanation of your assessment based on these criteria.\n\nEmail text:\n${emailText}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing email:', error);
      return 'Error analyzing email. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailText = formData.get('email') as string;

    // Show loading state
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Analyzing...';
    submitButton.disabled = true;

    try {
      // Get the analysis
      const analysis = await analyzeEmail(emailText);

      // Update userData with both email and analysis
      const writingData = {
        to: formData.get('to'),
        subject: formData.get('subject'),
        email: emailText,
        analysis: analysis
      };
      
      updateUserData('writingData', writingData);
      onNext();
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error analyzing your email. Please try again.');
      
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
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
      <h1 className="text-4xl font-bold text-center">Writing Assessment</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src="https://justindonlon.com/wp-content/uploads/2024/11/WritingPage.mp4"
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

      {/* Form Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          Write Sarah an email in the box below.
        </h2>
        
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
                defaultValue="sarah@linguaphone.com"
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
                defaultValue="Suggestions for your trip to London"
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 min-w-[200px]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}