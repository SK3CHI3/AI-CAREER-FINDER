export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          messages: ChatMessage[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages: ChatMessage[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: ChatMessage[]
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          school_level: 'primary' | 'secondary' | 'tertiary' | null
          current_grade: string | null
          subjects: string[] | null
          interests: string[] | null
          career_goals: string | null
          assessment_results: {
            skills: string[]
            strengths: string[]
            interests: string[]
            recommendations: string[]
          } | null
          previous_recommendations: {
            career: string
            score: number
            description: string
          }[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          school_level?: 'primary' | 'secondary' | 'tertiary' | null
          current_grade?: string | null
          subjects?: string[] | null
          interests?: string[] | null
          career_goals?: string | null
          assessment_results?: {
            skills: string[]
            strengths: string[]
            interests: string[]
            recommendations: string[]
          } | null
          previous_recommendations?: {
            career: string
            score: number
            description: string
          }[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          school_level?: 'primary' | 'secondary' | 'tertiary' | null
          current_grade?: string | null
          subjects?: string[] | null
          interests?: string[] | null
          career_goals?: string | null
          assessment_results?: {
            skills: string[]
            strengths: string[]
            interests: string[]
            recommendations: string[]
          } | null
          previous_recommendations?: {
            career: string
            score: number
            description: string
          }[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
