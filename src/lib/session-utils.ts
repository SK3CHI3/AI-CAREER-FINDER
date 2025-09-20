// Session management utilities for 30-day persistence
import { supabase } from './supabase'

// Session configuration for 30-day persistence
export const SESSION_CONFIG = {
  // 30 days in milliseconds
  MAX_SESSION_DURATION: 30 * 24 * 60 * 60 * 1000,
  // Refresh token every 5 minutes to keep session alive
  REFRESH_INTERVAL: 5 * 60 * 1000,
}

// Simple session manager for 30-day persistence
class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null

  constructor() {
    this.startRefreshTimer()
  }

  // Start refresh timer to keep session alive for 30 days
  private startRefreshTimer() {
    this.refreshTimer = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Check if session is near expiry (after 25 days)
          const now = Date.now()
          const sessionAge = now - (session.user.created_at ? new Date(session.user.created_at).getTime() : now)
          
          // If session is older than 25 days, refresh it to maintain 30-day persistence
          if (sessionAge > (25 * 24 * 60 * 60 * 1000)) {
            console.log('🔄 Refreshing session to maintain 30-day persistence')
            await supabase.auth.refreshSession()
          }
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
      }
    }, SESSION_CONFIG.REFRESH_INTERVAL)
  }

  // Check if session is valid (within 30 days)
  async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false

      // Check if session is within 30-day limit
      const now = Date.now()
      const sessionAge = now - (session.user.created_at ? new Date(session.user.created_at).getTime() : now)
      
      return sessionAge < SESSION_CONFIG.MAX_SESSION_DURATION
    } catch (error) {
      console.error('Error checking session validity:', error)
      return false
    }
  }

  // Cleanup
  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }
}

// Lazy-loaded session manager to avoid initialization issues
let sessionManagerInstance: SessionManager | null = null

const getSessionManager = () => {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager()
  }
  return sessionManagerInstance
}

// Export utility functions
export const isSessionValid = () => getSessionManager().isSessionValid()

export default getSessionManager
