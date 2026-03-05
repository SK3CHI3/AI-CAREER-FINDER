export interface AIConversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  school_level?: 'primary' | 'secondary' | 'tertiary';
  current_grade?: string;
  subjects?: string[];
  interests?: string[];
  career_goals?: string;
  assessment_results?: {
    riasec_scores?: {
      realistic: number;
      investigative: number;
      artistic: number;
      social: number;
      enterprising: number;
      conventional: number;
    };
    personality_type?: string[]; // e.g., ["Social", "Artistic"]
    values?: string[];
    skills?: string[];
    strengths?: string[];
    interests?: string[];
    recommendations?: string[];
  };
  previous_recommendations?: {
    career: string;
    score: number;
    description: string;
  }[];
  created_at: string;
  updated_at: string;
}
