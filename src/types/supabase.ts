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
      // School-integrated pivot (Phase 0)
      schools: {
        Row: {
          id: string
          name: string
          code: string
          region: string | null
          subscription_tier: string | null
          status: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          region?: string | null
          subscription_tier?: string | null
          status?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          region?: string | null
          subscription_tier?: string | null
          status?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      school_members: {
        Row: {
          id: string
          school_id: string
          user_id: string
          role: 'school_admin' | 'teacher'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id: string
          role: 'school_admin' | 'teacher'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          user_id?: string
          role?: 'school_admin' | 'teacher'
          invited_by?: string | null
          joined_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school_id: string
          name: string
          grade_level: string | null
          academic_year: string | null
          teacher_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          grade_level?: string | null
          academic_year?: string | null
          teacher_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          grade_level?: string | null
          academic_year?: string | null
          teacher_id?: string | null
          created_at?: string
        }
      }
      class_enrollments: {
        Row: {
          id: string
          class_id: string
          student_user_id: string
          enrolled_at: string
          source: 'manual' | 'spreadsheet'
        }
        Insert: {
          id?: string
          class_id: string
          student_user_id: string
          enrolled_at?: string
          source?: 'manual' | 'spreadsheet'
        }
        Update: {
          id?: string
          class_id?: string
          student_user_id?: string
          enrolled_at?: string
          source?: 'manual' | 'spreadsheet'
        }
      }
      school_subscriptions: {
        Row: {
          id: string
          school_id: string
          tier: string
          started_at: string
          expires_at: string | null
          payment_reference: string | null
        }
        Insert: {
          id?: string
          school_id: string
          tier: string
          started_at: string
          expires_at?: string | null
          payment_reference?: string | null
        }
        Update: {
          id?: string
          school_id?: string
          tier?: string
          started_at?: string
          expires_at?: string | null
          payment_reference?: string | null
        }
      }
    }
  }
}
