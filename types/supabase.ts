export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          time_commitment?: string
          motivation?: string[]
          interests?: string[]
          created_at?: string
          updated_at?: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
    }
  }
}

export type SpeakingAssessment = {
  userId: string;
  transcript: string;
  oliverResponse: string;
  timestamp: string;
} 