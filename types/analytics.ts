export interface APIUsageData {
  timestamp: string;
  page: 'welcome' | 'speaking' | 'writing';
  type: 'transcription' | 'analysis';
  tokensUsed: number;
  cost: number;
  success: boolean;
  error?: string;
}

export interface APIUsageSummary {
  totalCost: number;
  totalTokens: number;
  requestsByPage: Record<string, number>;
  averageCostPerRequest: number;
  errors: number;
}
