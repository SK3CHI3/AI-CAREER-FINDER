import { supabase } from './supabase'
import { Database } from './database.types'

export type TermDates = {
  [key: string]: {
    start: string
    end: string
  }
}

export interface SubscriptionStatus {
  isActive: boolean
  type: 'individual' | 'institutional' | 'trial' | 'none'
  expiresAt: string | null
  isTrialEligible: boolean
}

class SubscriptionService {
  private async getTermDates(): Promise<TermDates> {
    const { data, error } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'current_term_dates')
      .single()

    if (error || !data) {
      // Fallback to default 2026 dates (Current Year)
      return {
        term1: { start: '2026-01-05', end: '2026-04-10' },
        term2: { start: '2026-05-04', end: '2026-08-07' },
        term3: { start: '2026-08-31', end: '2026-10-30' }
      }
    }

    return data.value as TermDates
  }

  async getCurrentTerm(): Promise<{ term: string; dates: { start: string; end: string } } | null> {
    const dates = await this.getTermDates()
    const now = new Date()

    for (const [term, range] of Object.entries(dates)) {
      const start = new Date(range.start)
      const end = new Date(range.end)
      if (now >= start && now <= end) {
        return { term, dates: range }
      }
    }

    // If between terms, return the upcoming term
    const entries = Object.entries(dates).sort((a, b) => new Date(a[1].start).getTime() - new Date(b[1].start).getTime())
    for (const [term, range] of entries) {
      if (now < new Date(range.start)) {
        return { term, dates: range }
      }
    }

    return null
  }

  async checkSubscriptionStatus(profile: any): Promise<SubscriptionStatus> {
    if (!profile) {
      return { isActive: false, type: 'none', expiresAt: null, isTrialEligible: false }
    }

    const now = new Date()
    
    // 1. Check if institutional subscription exists via school
    if (profile.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('created_at')
        .eq('id', profile.school_id)
        .single()
      
      if (school) {
        const { data: schoolSub } = await supabase
          .from('school_subscriptions')
          .select('*')
          .eq('school_id', profile.school_id)
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (schoolSub && schoolSub.expires_at && new Date(schoolSub.expires_at) > now) {
          return {
            isActive: true,
            type: 'institutional',
            expiresAt: schoolSub.expires_at,
            isTrialEligible: false
          }
        }

        // Check if school is in its first term (Free Trial)
        const currentTerm = await this.getCurrentTerm()
        if (currentTerm) {
          const schoolCreated = new Date(school.created_at!)
          const termStart = new Date(currentTerm.dates.start)
          const termEnd = new Date(currentTerm.dates.end)
          
          // If school was created in this term or earlier, but term hasn't ended yet
          // Actually "First Term Free" means if current date is within the term where they created
          if (schoolCreated <= termEnd && schoolCreated >= termStart) {
            return {
              isActive: true,
              type: 'trial',
              expiresAt: currentTerm.dates.end,
              isTrialEligible: true
            }
          }
        }
      }
    }

    // 2. Check individual subscription
    if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) > now) {
      return {
        isActive: true,
        type: (profile.subscription_type as 'individual' | 'institutional' | 'trial') || 'individual',
        expiresAt: profile.subscription_expires_at,
        isTrialEligible: !profile.is_trial_used
      }
    }

    // 3. Check if user is eligible for trial (First Term Free)
    if (!profile.is_trial_used) {
        const currentTerm = await this.getCurrentTerm()
        if (currentTerm) {
            const userCreated = new Date(profile.created_at!)
            const termEnd = new Date(currentTerm.dates.end)
            
            // If they signed up during this term, they are in their free trial
            if (userCreated <= termEnd) {
                return {
                    isActive: true,
                    type: 'trial',
                    expiresAt: currentTerm.dates.end,
                    isTrialEligible: true
                }
            }
        }
    }

    return {
      isActive: false,
      type: 'none',
      expiresAt: null,
      isTrialEligible: !profile.is_trial_used
    }
  }

  async activateTrial(userId: string): Promise<void> {
    const currentTerm = await this.getCurrentTerm()
    if (!currentTerm) throw new Error('Could not determine current academic term')

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: 'trial' as any,
        subscription_expires_at: currentTerm.dates.end,
        is_trial_used: true
      })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }
}

export const subscriptionService = new SubscriptionService()
