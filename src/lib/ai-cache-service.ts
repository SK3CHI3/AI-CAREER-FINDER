import { supabase } from './supabase'

export interface CachedCareerRecommendation {
  id?: string
  user_id: string
  career_name: string
  match_percentage: number
  description?: string
  salary_range?: string
  education?: string
  growth?: string
  why_recommended?: string
  created_at?: string
  updated_at?: string
}

export interface CachedCareerDetails {
  id?: string
  user_id: string
  career_name: string
  details: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface CachedCourseRecommendations {
  id?: string
  user_id: string
  courses: Record<string, unknown>[]
  created_at?: string
  updated_at?: string
}

export interface CacheInvalidation {
  id?: string
  user_id: string
  cache_type: 'career_recommendations' | 'career_details' | 'course_recommendations'
  invalidated_at?: string
  reason?: string
}

class AICacheService {
  private readonly CACHE_DURATION_HOURS = 24 // Cache for 24 hours
  private readonly CACHE_DURATION_MS = this.CACHE_DURATION_HOURS * 60 * 60 * 1000

  // Check if cache is valid (not expired and not invalidated)
  private async isCacheValid(userId: string, cacheType: string): Promise<boolean> {
    try {
      // Check if cache was invalidated recently
      // @ts-ignore - Database types not fully generated
      const { data: invalidation, error } = await supabase
        .from('cache_invalidation')
        .select('invalidated_at')
        .eq('user_id', userId)
        .eq('cache_type', cacheType)
        .order('invalidated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // If there's an error or no invalidation record, cache is valid
      if (error) {
        console.warn('Error checking cache invalidation:', error)
        return true // Assume cache is valid if we can't check
      }

      if (invalidation) {
        const invalidatedAt = new Date(invalidation.invalidated_at)
        const now = new Date()
        const hoursSinceInvalidation = (now.getTime() - invalidatedAt.getTime()) / (1000 * 60 * 60)
        
        // If invalidated within the last 24 hours, cache is not valid
        if (hoursSinceInvalidation < this.CACHE_DURATION_HOURS) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error checking cache validity:', error)
      return true // Assume cache is valid if we can't check
    }
  }

  // Mark cache as invalidated
  async invalidateCache(userId: string, cacheType: string, reason: string = 'manual_refresh'): Promise<void> {
    try {
      // @ts-ignore - Database types not fully generated
      const { error } = await supabase
        .from('cache_invalidation')
        .upsert({
          user_id: userId,
          cache_type: cacheType,
          reason: reason
        })
      
      if (error) {
        console.warn('Error invalidating cache:', error)
      } else {
        console.log(`Cache invalidated for user ${userId}, type: ${cacheType}, reason: ${reason}`)
      }
    } catch (error) {
      console.error('Error invalidating cache:', error)
    }
  }

  // Career Recommendations Caching
  async getCachedCareerRecommendations(userId: string): Promise<CachedCareerRecommendation[] | null> {
    try {
      const isValid = await this.isCacheValid(userId, 'career_recommendations')
      if (!isValid) {
        console.log('Career recommendations cache is invalid, returning null')
        return null
      }

      // @ts-ignore - Database types not fully generated
      const { data, error } = await supabase
        .from('cached_career_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('match_percentage', { ascending: false })

      if (error) {
        console.warn('Error fetching cached career recommendations:', error)
        return null
      }

      return data || []
    } catch (error) {
      console.error('Error getting cached career recommendations:', error)
      return null
    }
  }

  async saveCareerRecommendations(userId: string, recommendations: Record<string, unknown>[]): Promise<void> {
    try {
      // Clear existing recommendations for this user
      // @ts-ignore - Database types not fully generated
      const { error: deleteError } = await supabase
        .from('cached_career_recommendations')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.warn('Error clearing existing career recommendations:', deleteError)
      }

      // Insert new recommendations
      const recommendationsToSave = recommendations.map(rec => ({
        user_id: userId,
        career_name: rec.title || rec.name,
        match_percentage: rec.matchPercentage || rec.value || 0,
        description: rec.description,
        salary_range: rec.salaryRange,
        education: rec.education,
        growth: rec.growth,
        why_recommended: rec.whyRecommended
      }))

      // @ts-ignore - Database types not fully generated
      const { error } = await supabase
        .from('cached_career_recommendations')
        .insert(recommendationsToSave)

      if (error) {
        console.warn('Error saving career recommendations:', error)
      } else {
        console.log(`Saved ${recommendationsToSave.length} career recommendations to cache`)
      }
    } catch (error) {
      console.error('Error saving career recommendations:', error)
    }
  }

  // Career Details Caching
  async getCachedCareerDetails(userId: string, careerName: string): Promise<Record<string, unknown> | null> {
    try {
      const isValid = await this.isCacheValid(userId, 'career_details')
      if (!isValid) {
        console.log('Career details cache is invalid, returning null')
        return null
      }

      // @ts-ignore - Database types not fully generated
      const { data, error } = await supabase
        .from('cached_career_details')
        .select('details')
        .eq('user_id', userId)
        .eq('career_name', careerName)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching cached career details:', error)
        return null
      }

      return data?.details ?? null
    } catch (error) {
      console.error('Error getting cached career details:', error)
      return null
    }
  }

  async saveCareerDetails(userId: string, careerName: string, details: Record<string, unknown>): Promise<void> {
    try {
      // @ts-ignore - Database types not fully generated
      const { error } = await supabase
        .from('cached_career_details')
        .upsert({
          user_id: userId,
          career_name: careerName,
          details: details
        })

      if (error) {
        console.warn('Error saving career details:', error)
      } else {
        console.log(`Saved career details for ${careerName} to cache`)
      }
    } catch (error) {
      console.error('Error saving career details:', error)
    }
  }

  // Course Recommendations Caching
  async getCachedCourseRecommendations(userId: string): Promise<Record<string, unknown>[] | null> {
    try {
      const isValid = await this.isCacheValid(userId, 'course_recommendations')
      if (!isValid) {
        console.log('Course recommendations cache is invalid, returning null')
        return null
      }

      // @ts-ignore - Database types not fully generated
      const { data, error } = await supabase
        .from('cached_course_recommendations')
        .select('courses')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Error fetching cached course recommendations:', error)
        return null
      }

      return data?.courses ?? null
    } catch (error) {
      console.error('Error getting cached course recommendations:', error)
      return null
    }
  }

  async saveCourseRecommendations(userId: string, courses: Record<string, unknown>[]): Promise<void> {
    try {
      // @ts-ignore - Database types not fully generated
      const { error } = await supabase
        .from('cached_course_recommendations')
        .upsert({
          user_id: userId,
          courses: courses
        })

      if (error) {
        console.warn('Error saving course recommendations:', error)
      } else {
        console.log(`Saved ${courses.length} course recommendations to cache`)
      }
    } catch (error) {
      console.error('Error saving course recommendations:', error)
    }
  }

  // Invalidate all caches for a user (useful when profile or grades change)
  async invalidateAllCaches(userId: string, reason: string = 'profile_updated'): Promise<void> {
    const cacheTypes = ['career_recommendations', 'career_details', 'course_recommendations']
    
    for (const cacheType of cacheTypes) {
      await this.invalidateCache(userId, cacheType, reason)
    }
    
    console.log(`Invalidated all caches for user ${userId}, reason: ${reason}`)
  }

  // Clear all cached data for a user
  async clearAllCaches(userId: string): Promise<void> {
    try {
      // @ts-ignore - Database types not fully generated
      const results = await Promise.allSettled([
        supabase.from('cached_career_recommendations').delete().eq('user_id', userId),
        supabase.from('cached_career_details').delete().eq('user_id', userId),
        supabase.from('cached_course_recommendations').delete().eq('user_id', userId),
        supabase.from('cache_invalidation').delete().eq('user_id', userId)
      ])
      
      // Check for any errors
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Error clearing cache ${index}:`, result.reason)
        }
      })
      
      console.log(`Cleared all caches for user ${userId}`)
    } catch (error) {
      console.error('Error clearing caches:', error)
    }
  }
}

export const aiCacheService = new AICacheService()
