import type { SpeechaceScores } from '@/app/types';

export const SCORING_VERSION = '1.0.0';

// CEFR mapping based on Speechace documentation
export const mapScoreToCEFR = (scores: {
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
}): { level: string; description: string } => {
  // Calculate weighted average
  const weightedScore = (
    scores.pronunciation * 0.3 +  // 30% weight
    scores.fluency * 0.3 +       // 30% weight
    scores.vocabulary * 0.2 +    // 20% weight
    scores.grammar * 0.2         // 20% weight
  );

  // Map to CEFR levels
  if (weightedScore >= 90) return { level: 'C2', description: 'Mastery' };
  if (weightedScore >= 80) return { level: 'C1', description: 'Advanced' };
  if (weightedScore >= 70) return { level: 'B2', description: 'Upper Intermediate' };
  if (weightedScore >= 60) return { level: 'B1', description: 'Intermediate' };
  if (weightedScore >= 45) return { level: 'A2', description: 'Elementary' };
  return { level: 'A1', description: 'Beginner' };
};

// Normalize scores to 0-9 scale
export const normalizeScore = (score: number): number => {
  return Math.min(Math.max((score / 100) * 9, 0), 9);
};

export const calculateScores = (speechaceData: any): SpeechaceScores => {
  const wordScores = speechaceData.analysis?.text_score?.word_score_list || [];
  
  // Calculate raw scores
  const rawScores = {
    pronunciation: calculatePronunciationScore(wordScores),
    fluency: calculateFluencyScore(wordScores),
    vocabulary: calculateVocabularyScore(wordScores),
    grammar: calculateGrammarScore(wordScores),
    overall: 0
  };

  // Calculate overall score
  rawScores.overall = (
    rawScores.pronunciation * 0.3 +
    rawScores.fluency * 0.3 +
    rawScores.vocabulary * 0.2 +
    rawScores.grammar * 0.2
  );

  // Normalize all scores to 0-9 scale
  const normalizedScores = {
    pronunciation: normalizeScore(rawScores.pronunciation),
    fluency: normalizeScore(rawScores.fluency),
    vocabulary: normalizeScore(rawScores.vocabulary),
    grammar: normalizeScore(rawScores.grammar),
    overall: normalizeScore(rawScores.overall)
  };

  return {
    raw: rawScores,
    normalized: normalizedScores,
    cefr: mapScoreToCEFR(normalizedScores),
    metadata: {
      scoringVersion: SCORING_VERSION,
      scoringDate: new Date().toISOString(),
      scoringMethod: 'speechace-algorithm-v1'
    },
    technicalDetails: {
      wordScores: wordScores.map((word: any) => ({
        word: word.word,
        qualityScore: word.quality_score,
        phoneticDetails: word.phone_score_list
      })),
      speechRate: calculateSpeechRate(wordScores)
    }
  };
};

// Individual scoring functions
function calculatePronunciationScore(wordScores: any[]): number {
  // Implementation based on phone_score_list quality scores
  return wordScores.reduce((acc, word) => {
    const phoneScores = word.phone_score_list?.map((p: any) => p.quality_score) || [];
    return acc + (phoneScores.reduce((sum: number, score: number) => sum + score, 0) / (phoneScores.length || 1));
  }, 0) / (wordScores.length || 1);
}

function calculateFluencyScore(wordScores: any[]): number {
  // Implementation considering pause patterns and stress
  // ... detailed implementation
  return 0; // Placeholder
}

function calculateVocabularyScore(wordScores: any[]): number {
  // Implementation based on word complexity and usage
  // ... detailed implementation
  return 0; // Placeholder
}

function calculateGrammarScore(wordScores: any[]): number {
  // Implementation based on word order and relationships
  // ... detailed implementation
  return 0; // Placeholder
}

function calculateSpeechRate(wordScores: any[]): number {
  // Implementation for words per minute
  // ... detailed implementation
  return 0; // Placeholder
} 