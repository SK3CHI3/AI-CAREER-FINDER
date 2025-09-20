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
      cached_career_recommendations: {
        Row: {
          id: string
          user_id: string
          career_name: string
          match_percentage: number
          description: string | null
          salary_range: string | null
          education: string | null
          growth: string | null
          why_recommended: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          career_name: string
          match_percentage: number
          description?: string | null
          salary_range?: string | null
          education?: string | null
          growth?: string | null
          why_recommended?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          career_name?: string
          match_percentage?: number
          description?: string | null
          salary_range?: string | null
          education?: string | null
          growth?: string | null
          why_recommended?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cached_career_details: {
        Row: {
          id: string
          user_id: string
          career_name: string
          details: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          career_name: string
          details: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          career_name?: string
          details?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cached_course_recommendations: {
        Row: {
          id: string
          user_id: string
          courses: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          courses: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          courses?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cache_invalidation: {
        Row: {
          id: string
          user_id: string
          cache_type: 'career_recommendations' | 'career_details' | 'course_recommendations'
          invalidated_at: string
          reason: string | null
        }
        Insert: {
          id?: string
          user_id: string
          cache_type: 'career_recommendations' | 'career_details' | 'course_recommendations'
          invalidated_at?: string
          reason?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          cache_type?: 'career_recommendations' | 'career_details' | 'course_recommendations'
          invalidated_at?: string
          reason?: string | null
        }
      }
    }
  }
}
