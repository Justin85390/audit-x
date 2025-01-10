import React from 'react';

interface AIAnimationProps {
  isThinking: boolean;
  isSpeaking: boolean;
}

const AIAnimation: React.FC<AIAnimationProps> = ({ isThinking, isSpeaking }) => {
  return (
    <div className="flex items-center justify-center w-12 h-12">
      {isThinking && (
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-black rounded-full animate-pulse-scale"></div>
        </div>
      )}
      
      {isSpeaking && (
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 bg-black rounded-full animate-sound-wave"
              style={{
                height: '24px',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAnimation;
