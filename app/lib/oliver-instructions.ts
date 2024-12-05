// Define interfaces for our data structures
interface Difficulty {
  difficulty: string;
  followUp: string;
}

interface FocusPoint {
  triggers: string[];
  identifyResponse: (transcript: string) => Difficulty;
}

interface FocusPoints {
  [key: string]: FocusPoint;
}

interface IdentifiedDifficulty {
  category: string;
  difficulty: string;
  followUp: string;
}

// Constants
export const AUDIT_DESCRIPTION = `The Linguaphone audit is a comprehensive assessment of English speaking skills that:
- Takes about 15-20 minutes to complete
- Includes reading passages, conversation questions, and pronunciation exercises
- Provides detailed feedback on fluency, pronunciation, and speaking confidence
- Helps identify specific areas for improvement
- Creates a personalized learning plan based on the results
- Can be retaken to track progress over time`;

export const OLIVER_BASE = `You are Oliver, a friendly and supportive learning assistant. When discussing the Linguaphone audit, use this description: ${AUDIT_DESCRIPTION}

Your role is to:
- Help users understand and navigate the language audit process
- Provide clear explanations about the assessment
- Maintain a warm, patient, and encouraging tone
- Keep responses clear and concise (1-2 sentences when possible)
- Never refer to yourself as an AI - always use terms like "learning assistant" or "conversation partner" instead
- Always respond in the same language that the user used to ask their question
- Support multiple languages and automatically detect the user's preferred language`;

export const OLIVER_WEBAPP = `When discussing the language audit webapp, explain that ${AUDIT_DESCRIPTION}`;

export const OLIVER_SPEAKING_ASSESSMENT = {
  focusPoints: {
    grammar: {
      triggers: [
        // Basic Grammar
        'grammar', 'structure', 'tenses', 'rules', 'sentence', 'articles', 'prepositions', 
        'conjugation', 'verb forms',
        // Verb Tenses
        'present tense', 'past tense', 'future tense', 'perfect tense', 'continuous tense',
        'conditional', 'subjunctive', 'modal verbs', 'auxiliary verbs', 'irregular verbs',
        'passive voice', 'active voice',
        // Sentence Structure
        'word order', 'clause', 'complex sentences', 'compound sentences', 'relative clauses',
        'dependent clauses', 'independent clauses', 'sentence patterns', 'syntax',
        // Parts of Speech
        'nouns', 'pronouns', 'adjectives', 'adverbs', 'conjunctions', 'singular', 'plural',
        'countable', 'uncountable', 'possessive', 'determiners', 'quantifiers',
        'comparatives', 'superlatives'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    pronunciation: {
      triggers: [
        // Basic Pronunciation
        'pronunciation', 'sound', 'speak clearly', 'pronounce', 'intonation',
        'stress', 'rhythm', 'phonetics',
        // Specific Sounds
        'vowel sounds', 'consonant sounds', 'th sound', 'r sound', 'l sound', 
        'word stress', 'sentence stress', 'connected speech', 'linking sounds',
        // Speaking Patterns
        'pitch', 'tone', 'voice', 'articulation', 'enunciation', 'clarity',
        'pronunciation patterns', 'sound patterns', 'mouth position', 'tongue position'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    listening: {
      triggers: [
        // Basic Listening
        'listening', 'understand', 'accent', 'hearing', 'comprehend', 'fast speakers',
        'speed of speech', 'native speakers',
        // Specific Challenges
        'different accents', 'background noise', 'multiple speakers', 'natural speech',
        'connected speech', 'reduced forms', 'casual speech', 'formal speech',
        // Context
        'movies', 'tv shows', 'radio', 'podcasts', 'phone calls', 'video calls',
        'conversations', 'lectures', 'announcements', 'public speaking'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    vocabulary: {
      triggers: [
        // Basic Vocabulary
        'vocabulary', 'words', 'phrases', 'terms', 'lexis', 'expressions',
        'collocations', 'lack of words',
        // Types of Vocabulary
        'academic words', 'business terms', 'technical vocabulary', 'casual words',
        'formal words', 'slang', 'idioms', 'phrasal verbs', 'synonyms', 'antonyms',
        // Usage
        'word choice', 'word usage', 'word meaning', 'context', 'register',
        'appropriateness', 'word families', 'word formation', 'derivatives'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    fluency: {
      triggers: [
        // Basic Fluency
        'fluency', 'speak fast', 'flow', 'pauses', 'continuous speech',
        'hesitation', 'confidence',
        // Speaking Patterns
        'speaking speed', 'natural speech', 'smooth speech', 'connected speech',
        'speech rate', 'pace', 'rhythm', 'automaticity',
        // Challenges
        'getting stuck', 'losing words', 'mental blocks', 'thinking time',
        'processing speed', 'response time', 'speaking anxiety', 'speaking fear'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    businessCommunication: {
      triggers: [
        // Basic Business Communication
        'emails', 'meetings', 'business', 'negotiations', 'presentations',
        'formal', 'reports', 'professional', 'communication at work',
        // Specific Contexts
        'conference calls', 'video meetings', 'client meetings', 'team meetings',
        'business writing', 'business presentations', 'networking', 'small talk',
        // Documents
        'proposals', 'contracts', 'memos', 'business letters', 'executive summaries',
        'business reports', 'meeting minutes', 'business plans'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    culturalDifferences: {
      triggers: [
        // Basic Cultural Aspects
        'cultural', 'politeness', 'formal', 'informal', 'manners', 'etiquette',
        'phrases', 'small talk',
        // Social Interactions
        'social norms', 'customs', 'traditions', 'social expectations', 'body language',
        'gestures', 'eye contact', 'personal space',
        // Communication Styles
        'directness', 'indirectness', 'formality levels', 'respect levels',
        'hierarchy', 'social status', 'relationship building', 'networking'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    comprehension: {
      triggers: [
        // Basic Comprehension
        'understand', 'comprehension', 'reading', 'listening', 'grasp meaning',
        'understanding text',
        // Reading Skills
        'reading speed', 'scanning', 'skimming', 'detailed reading', 'critical reading',
        'academic reading', 'technical reading', 'reading strategies',
        // Understanding
        'main ideas', 'details', 'inference', 'context clues', 'text organization',
        'authors purpose', 'tone', 'implied meaning'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint,

    accent: {
      triggers: [
        // Basic Accent
        'accent', 'native accent', 'foreign accent', 'regional accent',
        'accent reduction', 'accent modification', 'accent training',
        // Specific Accent Types
        'british accent', 'american accent', 'australian accent',
        'neutral accent', 'standard accent',
        // Accent Features
        'accent clarity', 'accent intelligibility', 'accent comprehension',
        'accent improvement', 'accent adaptation'
      ],
      identifyResponse: createStandardResponse
    } as FocusPoint
  } as FocusPoints,

  questions: [
    "If I can interrupt for just a minute, I'd like to understand your challenges better.",
    "Thank you for sharing. Let's move on to the next part of the assessment."
  ] as const,

  finalResponse: "Thanks for your response, select continue when you are ready.",
  context: 'speaking-assessment' as const,

  instructions: `You are Oliver, conducting the speaking assessment portion of the Linguaphone audit.
    - Listen carefully to the user's responses about their English challenges
    - Identify specific difficulties they mention
    - Ask relevant follow-up questions to understand their challenges better
    - Maintain a supportive and professional tone
    - Keep responses focused on understanding their English learning needs
    - Use the predefined questions and follow-ups
    - Record all responses for the assessment report`
} as const;

// Helper function to create standard response
function createStandardResponse(transcript: string): Difficulty {
  const points: string[] = [];
  const lowerTranscript = transcript.toLowerCase();
  
  // Add all matching triggers to points array
  Object.entries(OLIVER_SPEAKING_ASSESSMENT.focusPoints).forEach(([category, data]) => {
    data.triggers.forEach(trigger => {
      if (lowerTranscript.includes(trigger.toLowerCase())) {
        points.push(trigger);
      }
    });
  });

  const mentioned = points.length ? points.join(' and ') : 'this aspect';
  
  return {
    difficulty: mentioned,
    followUp: `I understand that ${mentioned} is particularly challenging for you. Could you tell me more?`
  };
}

export const constructOliverResponse = (transcript: string): string => {
  const transcriptLower = transcript.toLowerCase();
  
  // Identify all mentioned difficulties
  const identifiedDifficulties: IdentifiedDifficulty[] = [];
  
  for (const [category, data] of Object.entries(OLIVER_SPEAKING_ASSESSMENT.focusPoints)) {
    if (data.triggers.some(trigger => transcriptLower.includes(trigger))) {
      const response = data.identifyResponse(transcript);
      // Only add if this difficulty hasn't been identified yet
      if (!identifiedDifficulties.some(d => d.difficulty === response.difficulty)) {
        identifiedDifficulties.push({
          category,
          ...response
        });
      }
    }
  }
  
  if (identifiedDifficulties.length > 0) {
    // Construct response with unique difficulties
    const uniqueDifficulties = Array.from(new Set(identifiedDifficulties.map(d => d.category)));
    const difficulties = uniqueDifficulties.join(' and ');
      
    // Debug logs
    console.log('Identified Difficulties:', identifiedDifficulties);
    console.log('Unique Categories:', uniqueDifficulties);
    console.log('Final String:', difficulties);
      
    // Different responses based on number of unique difficulties
    if (uniqueDifficulties.length === 1) {
      return `If I can interrupt for just a minute, I understand that you have difficulties with ${difficulties}. Could you tell me more?`;
    } else {
      return `If I can interrupt for just a minute, I understand that you have difficulties with ${difficulties}. Can you tell me more about some of these?`;
    }
  }
  
  // Default response if no specific difficulties are identified
  return "If I can interrupt for just a minute, could you repeat that please? What difficulties would you like to focus on?";
};

// Add these type definitions
export interface TranscriptItem {
  speaker: 'user' | 'oliver';
  text: string;
  timestamp: string;
}

export interface SpeakingAssessmentData {
  userResponse: string;
  oliverFeedback: string;
  transcriptHistory: TranscriptItem[];
  focusAreas: string[];
  timestamp: string;
}
