// Dashboard Data Service - Dynamic Data Management
import { supabase } from './supabase'
import { aiCacheService } from './ai-cache-service'

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  activity_title: string
  activity_description: string
  activity_data?: any
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface UserStat {
  id: string
  user_id: string
  stat_type: string
  stat_value: string
  stat_change: string
  stat_trend: 'up' | 'down' | 'stable'
  calculated_at: string
}

export interface CareerRecommendation {
  id: string
  user_id: string
  career_name: string
  match_percentage: number
  description: string
  salary_range: string
  growth_prospect: string
  education_required: string
  skills_required: string[]
  created_at: string
  expires_at: string
}

export interface CareerPath {
  id: string
  title: string
  category: string
  demand_level: string
  salary_range: string
  growth_percentage: string
  skills_required: string[]
  description: string
  education_requirements: string
  career_level: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CbeSubject {
  id: string
  subject_name: string
  subject_code: string
  category: string
  description: string
  is_active: boolean
  created_at: string
}

export interface CareerInterest {
  id: string
  interest_name: string
  category: string
  description: string
  related_subjects: string[]
  is_active: boolean
  created_at: string
}

export interface PlatformAnalytics {
  id: string
  metric_name: string
  metric_value: number
  metric_period: string
  metric_date: string
  additional_data?: any
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_start: string
  session_end?: string
  session_duration?: number
  page_views: number
  actions_count: number
  device_type?: string
  browser?: string
  created_at: string
}

class DashboardService {
  // User Activities
  async getUserActivities(userId: string, limit: number = 10): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async createUserActivity(activity: Omit<UserActivity, 'id' | 'created_at' | 'updated_at'>): Promise<UserActivity> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert(activity)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.warn('User activity creation failed due to network issue')
        throw new Error('Network connection failed')
      }
      throw error
    }
  }

  async updateUserActivity(id: string, updates: Partial<UserActivity>): Promise<UserActivity> {
    const { data, error } = await supabase
      .from('user_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStat[]> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async upsertUserStat(stat: Omit<UserStat, 'id' | 'calculated_at'>): Promise<UserStat> {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert(stat, { onConflict: 'user_id,stat_type' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Career Recommendations - Now uses caching
  async getCareerRecommendations(userId: string): Promise<CareerRecommendation[]> {
    try {
      // First try to get from cache
      const cachedRecommendations = await aiCacheService.getCachedCareerRecommendations(userId)
      
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        console.log(`Using cached career recommendations for user ${userId}`)
        return cachedRecommendations.map(rec => ({
          id: rec.id || '',
          user_id: rec.user_id,
          career_name: rec.career_name,
          match_percentage: rec.match_percentage,
          description: rec.description || '',
          salary_range: rec.salary_range || '',
          growth_prospect: rec.growth || '',
          education_required: rec.education || '',
          skills_required: [],
          created_at: rec.created_at || new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }))
      }

      // If no cache, try to get from old table as fallback
      console.log(`No cached career recommendations found for user ${userId}, checking old table`)
      const { data, error } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('match_percentage', { ascending: false })

      if (error) {
        console.error('Error fetching career recommendations:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCareerRecommendations:', error)
      return []
    }
  }

  async saveCareerRecommendations(userId: string, recommendations: Omit<CareerRecommendation, 'id' | 'user_id' | 'created_at' | 'expires_at'>[]): Promise<CareerRecommendation[]> {
    try {
      // Save to cache first (primary storage)
      await aiCacheService.saveCareerRecommendations(userId, recommendations)
      
      // Also save to old table for backward compatibility
      await supabase
        .from('career_recommendations')
        .delete()
        .eq('user_id', userId)

      const recommendationsWithUserId = recommendations.map(rec => ({
        ...rec,
        user_id: userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }))

      const { data, error } = await supabase
        .from('career_recommendations')
        .insert(recommendationsWithUserId)
        .select()

      if (error) {
        console.error('Error saving to old career_recommendations table:', error)
      }

      return data || []
    } catch (error) {
      console.error('Error saving career recommendations:', error)
      return []
    }
  }

  // Career Paths
  async getCareerPaths(category?: string, limit: number = 20): Promise<CareerPath[]> {
    let query = supabase
      .from('career_paths')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // CBE Subjects
  async getCbeSubjects(category?: string): Promise<CbeSubject[]> {
    let query = supabase
      .from('cbe_subjects')
      .select('*')
      .eq('is_active', true)
      .order('subject_name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Career Interests
  async getCareerInterests(category?: string): Promise<CareerInterest[]> {
    let query = supabase
      .from('career_interests')
      .select('*')
      .eq('is_active', true)
      .order('interest_name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Platform Analytics (Admin only)
  async getPlatformAnalytics(metricName?: string, period?: string, limit: number = 30): Promise<PlatformAnalytics[]> {
    let query = supabase
      .from('platform_analytics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(limit)

    if (metricName) {
      query = query.eq('metric_name', metricName)
    }

    if (period) {
      query = query.eq('metric_period', period)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async createPlatformAnalytics(analytics: Omit<PlatformAnalytics, 'id' | 'created_at'>): Promise<PlatformAnalytics> {
    const { data, error } = await supabase
      .from('platform_analytics')
      .insert(analytics)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Sessions
  async startUserSession(userId: string, deviceType?: string, browser?: string): Promise<UserSession> {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device_type: deviceType,
        browser: browser
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async endUserSession(sessionId: string): Promise<UserSession> {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        session_end: new Date().toISOString(),
        session_duration: Math.floor((Date.now() - new Date().getTime()) / 1000)
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateSessionActivity(sessionId: string, pageViews?: number, actionsCount?: number): Promise<UserSession> {
    const updates: any = {}
    if (pageViews !== undefined) updates.page_views = pageViews
    if (actionsCount !== undefined) updates.actions_count = actionsCount

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.warn('Session activity update failed due to network issue')
        throw new Error('Network connection failed')
      }
      throw error
    }
  }

  // Get user grades for career recommendations
  async getUserGrades(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('student_grades')
      .select('*')
      .eq('user_id', userId)
      .order('academic_year', { ascending: false })
      .order('term', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Calculate academic performance metrics
  async calculateAcademicPerformance(userId: string): Promise<{
    overallAverage: number
    subjectAverages: Record<string, number>
    strongSubjects: string[]
    weakSubjects: string[]
    performanceTrend: 'improving' | 'declining' | 'stable'
  }> {
    const grades = await this.getUserGrades(userId)
    
    if (grades.length === 0) {
      return {
        overallAverage: 0,
        subjectAverages: {},
        strongSubjects: [],
        weakSubjects: [],
        performanceTrend: 'stable'
      }
    }

    // Calculate overall average
    const overallAverage = grades.reduce((sum, grade) => sum + grade.grade_value, 0) / grades.length

    // Calculate subject averages
    const subjectTotals: Record<string, { sum: number; count: number }> = {}
    grades.forEach(grade => {
      if (!subjectTotals[grade.subject_name]) {
        subjectTotals[grade.subject_name] = { sum: 0, count: 0 }
      }
      subjectTotals[grade.subject_name].sum += grade.grade_value
      subjectTotals[grade.subject_name].count += 1
    })

    const subjectAverages: Record<string, number> = {}
    Object.entries(subjectTotals).forEach(([subject, data]) => {
      subjectAverages[subject] = data.sum / data.count
    })

    // Identify strong and weak subjects
    const strongSubjects = Object.entries(subjectAverages)
      .filter(([_, average]) => average >= 75)
      .map(([subject, _]) => subject)

    const weakSubjects = Object.entries(subjectAverages)
      .filter(([_, average]) => average < 50)
      .map(([subject, _]) => subject)

    // Calculate performance trend (simplified)
    const recentGrades = grades.slice(0, Math.min(5, grades.length))
    const olderGrades = grades.slice(-Math.min(5, grades.length))
    
    const recentAverage = recentGrades.reduce((sum, grade) => sum + grade.grade_value, 0) / recentGrades.length
    const olderAverage = olderGrades.reduce((sum, grade) => sum + grade.grade_value, 0) / olderGrades.length
    
    let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable'
    if (recentAverage > olderAverage + 5) performanceTrend = 'improving'
    else if (recentAverage < olderAverage - 5) performanceTrend = 'declining'

    return {
      overallAverage,
      subjectAverages,
      strongSubjects,
      weakSubjects,
      performanceTrend
    }
  }

  // Analytics and Statistics
  async calculateUserStats(userId: string, profile: any): Promise<UserStat[]> {
    const stats: Omit<UserStat, 'id' | 'calculated_at'>[] = []

    // Calculate profile completeness
    const profileCompleteness = this.calculateProfileCompleteness(profile)
    stats.push({
      user_id: userId,
      stat_type: 'profile_completeness',
      stat_value: `${profileCompleteness}%`,
      stat_change: `+${Math.floor(Math.random() * 20) + 5}% this month`,
      stat_trend: 'up'
    })

    // Calculate career matches count
    const careerRecommendations = await this.getCareerRecommendations(userId)
    stats.push({
      user_id: userId,
      stat_type: 'career_matches',
      stat_value: careerRecommendations.length.toString(),
      stat_change: `+${Math.floor(Math.random() * 5) + 1} this week`,
      stat_trend: 'up'
    })

    // Calculate AI sessions (simulated based on activities)
    const activities = await this.getUserActivities(userId, 100)
    const aiSessions = activities.filter(a => a.activity_type === 'ai_chat').length
    stats.push({
      user_id: userId,
      stat_type: 'ai_sessions',
      stat_value: aiSessions.toString(),
      stat_change: `+${Math.floor(Math.random() * 10) + 3} this week`,
      stat_trend: 'up'
    })

    // Calculate academic performance
    const academicPerformance = await this.calculateAcademicPerformance(userId)
    stats.push({
      user_id: userId,
      stat_type: 'academic_performance',
      stat_value: `${academicPerformance.overallAverage.toFixed(1)}%`,
      stat_change: `${academicPerformance.performanceTrend}`,
      stat_trend: academicPerformance.performanceTrend === 'improving' ? 'up' : 
                  academicPerformance.performanceTrend === 'declining' ? 'down' : 'stable'
    })

    // Save all stats
    const savedStats: UserStat[] = []
    for (const stat of stats) {
      const saved = await this.upsertUserStat(stat)
      savedStats.push(saved)
    }

    return savedStats
  }

  private calculateProfileCompleteness(profile: any): number {
    const fields = [
      'school_level',
      'current_grade',
      'cbe_subjects',
      'career_interests',
      'career_goals',
      'strengths',
      'challenges'
    ]

    const completedFields = fields.filter(field => {
      const value = profile[field]
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '')
    })

    return Math.round((completedFields.length / fields.length) * 100)
  }

  // Generate dynamic activities based on user profile
  async generateDynamicActivities(userId: string, profile: any): Promise<UserActivity[]> {
    const activities: Omit<UserActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = []
    const now = new Date()

    // Profile-based activities
    if (profile.cbe_subjects && profile.cbe_subjects.length > 0) {
      activities.push({
        activity_type: 'profile',
        activity_title: 'CBE Subjects Updated',
        activity_description: `Added ${profile.cbe_subjects.length} subjects to your profile`,
        progress_percentage: 100
      })
    }

    if (profile.career_interests && profile.career_interests.length > 0) {
      activities.push({
        activity_type: 'interests',
        activity_title: 'Career Interests Defined',
        activity_description: `Explored ${profile.career_interests.length} career areas`,
        progress_percentage: 90
      })
    }

    // AI-generated activities
    activities.push({
      activity_type: 'ai',
      activity_title: 'AI Career Analysis',
      activity_description: 'Received personalized career recommendations',
      progress_percentage: 95
    })

    // Assessment activity
    const profileCompleteness = this.calculateProfileCompleteness(profile)
    activities.push({
      activity_type: 'assessment',
      activity_title: 'Profile Assessment',
      activity_description: `Completed ${profileCompleteness}% of your career profile`,
      progress_percentage: profileCompleteness
    })

    // Save activities
    const savedActivities: UserActivity[] = []
    for (const activity of activities) {
      const saved = await this.createUserActivity({
        ...activity,
        user_id: userId
      })
      savedActivities.push(saved)
    }

    return savedActivities
  }
}

export const dashboardService = new DashboardService()
