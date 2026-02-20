// Session management utilities for 30-day persistence
import { supabase } from './supabase'

// Session configuration for long-lived browser sessions
export const SESSION_CONFIG = {
  /**
   * Interval for checking whether the current session is nearing expiry.
   * Supabase already handles automatic refresh on page activity, but we keep
   * this lightweight polling to proactively refresh silent sessions.
   */
  REFRESH_INTERVAL: 5 * 60 * 1000,
  /**
   * Refresh the session when it is within this window from expiring.
   * (10 minutes expressed in milliseconds)
   */
  REFRESH_THRESHOLD: 10 * 60 * 1000,
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
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Session refresh poll failed, skipping this cycle:', error.message)
          return
        }

        const session = data.session
        if (!session) {
          return
        }

        const expiresAtMillis = session.expires_at ? session.expires_at * 1000 : null
        if (!expiresAtMillis) {
          // If Supabase does not provide an expiry timestamp (rare), skip proactive refresh.
          return
        }

        const timeUntilExpiry = expiresAtMillis - Date.now()
        if (timeUntilExpiry <= SESSION_CONFIG.REFRESH_THRESHOLD && timeUntilExpiry > 0) {
          console.log('🔄 Refreshing Supabase session before expiry window')
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('Error while attempting proactive session refresh:', error)
      }
    }, SESSION_CONFIG.REFRESH_INTERVAL)
  }

  // Check if session is valid (within 30 days)
  async isSessionValid(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.warn('Error checking session validity, assuming session is still valid to avoid spurious logouts:', error.message)
        return true
      }

      const session = data.session
      if (!session) {
        return false
      }

      const expiresAtMillis = session.expires_at ? session.expires_at * 1000 : null
      if (!expiresAtMillis) {
        // When Supabase cannot provide an expiry timestamp, fall back to trusting the current session.
        return true
      }

      return Date.now() < expiresAtMillis
    } catch (error) {
      console.error('Unexpected error checking session validity, treating session as valid:', error)
      return true
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

/** Stops the refresh timer and clears the singleton. Call on sign-out to avoid timers running after logout. */
export function destroySessionManager() {
  if (sessionManagerInstance) {
    sessionManagerInstance.destroy()
    sessionManagerInstance = null
  }
}

/**
 * Returns the singleton SessionManager (used internally by isSessionValid and destroySessionManager).
 * Export for advanced use only; prefer isSessionValid() and destroySessionManager().
 */
export default getSessionManager
