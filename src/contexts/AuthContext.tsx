// Production-Ready Auth Context - Official Supabase Pattern
import React, { createContext, useContext, useEffect, useState } from 'react'

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import { getJWTClaims, hasMFAEnabled, validateJWTForSensitiveOperation } from '@/lib/auth-utils'
import { isSessionValid, destroySessionManager } from '@/lib/session-utils'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  school_level?: 'primary' | 'secondary' | 'tertiary'
  current_grade?: string
  cbe_subjects?: string[]
  subjects?: string[]
  career_interests?: string[]
  interests?: string[]
  career_goals?: string
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_reference?: string
  payment_date?: string
  payment_amount?: number
  payment_currency?: string
  intasend_transaction_id?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  profileLoading: boolean
  profileError: Error | null
  isMFAEnabled: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  validateForSensitiveOperation: () => { isValid: boolean; reason?: string }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<Error | null>(null)
  const [isMFAEnabled, setIsMFAEnabled] = useState(false)

  // Fetch user profile - Simple and fast
  const fetchProfile = async (userId: string, forceRefresh = false) => {
    try {
      setProfileLoading(true)
      setProfileError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        const err = new Error(error.message)
        setProfileError(err)
        setProfile(null)
      } else {
        setProfile(data)
        setProfileError(null)
      }
    } catch (error) {
      setProfileError(error instanceof Error ? error : new Error(String(error)))
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize auth state - Simple and reliable
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        if (isDev) console.log('🔐 AuthContext: Starting initialization')

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        if (isDev) console.log('🔐 AuthContext: Got session:', session ? 'exists' : 'null')

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          if (isDev) console.log('🔐 AuthContext: User found, setting MFA and fetching profile')
          setIsMFAEnabled(hasMFAEnabled(session.user))
          // Fetch profile in background - don't wait for it
          fetchProfile(session.user.id).catch(error => {
            if (isDev) console.error('Background profile fetch failed:', error)
          })
        } else {
          if (isDev) console.log('🔐 AuthContext: No user found')
          setIsMFAEnabled(false)
        }
      } catch (error) {
        if (isDev) console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          if (isDev) console.log('🔐 AuthContext: Setting loading to false')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        setIsMFAEnabled(hasMFAEnabled(session.user))
        // Fetch profile in background
        fetchProfile(session.user.id).catch(error => {
          console.error('Background profile fetch failed:', error)
        })
      } else {
        setProfile(null)
        setProfileError(null)
        setIsMFAEnabled(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - only run once

  // Check session validity periodically (30-day limit)
  useEffect(() => {
    if (!user) return

    let isMounted = true

    const sessionCheckInterval = setInterval(async () => {
      const stillValid = await isSessionValid()
      if (stillValid) {
        return
      }

      if (isDev) console.log('🔄 Session reported as invalid, attempting silent refresh')
      const { data, error } = await supabase.auth.refreshSession()

      if (error || !data.session) {
        if (isDev) console.warn('Session refresh failed, signing user out', error)
        if (!isMounted) return
        setUser(null)
        setSession(null)
        setProfile(null)
        return
      }

      if (!isMounted) return
      setSession(data.session)
      setUser(data.session.user)
    }, 60000) // Check every minute

    return () => {
      isMounted = false
      clearInterval(sessionCheckInterval)
    }
  }, [user])

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  // Sign out
  const signOut = async () => {
    try {
      destroySessionManager()
      // Clear local state first
      setUser(null)
      setProfile(null)
      setProfileError(null)
      setSession(null)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        if (isDev) console.error('Sign out error:', error)
        return { error }
      }

      if (isDev) console.log('Successfully signed out')
      return { error: null }
    } catch (error) {
      if (isDev) console.error('Sign out error:', error)
      return { error: error as AuthError }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
      const { error } = await supabase
        .from('profiles')
        .update(updates as ProfileUpdate)
        .eq('id', user.id)

      if (error) throw error

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Refresh profile from database
  const refreshProfile = async () => {
    if (user) {
      if (isDev) console.log('Refreshing profile for user:', user.id)
      await fetchProfile(user.id, true) // Force refresh
    }
  }

  // Validate JWT for sensitive operations
  const validateForSensitiveOperation = () => {
    return validateJWTForSensitiveOperation(user)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    profileError,
    isMFAEnabled,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    validateForSensitiveOperation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}