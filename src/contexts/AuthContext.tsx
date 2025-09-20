// Production-Ready Auth Context - Official Supabase Pattern
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getJWTClaims, hasMFAEnabled, validateJWTForSensitiveOperation } from '@/lib/auth-utils'
import { isSessionValid } from '@/lib/session-utils'

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
  const [isMFAEnabled, setIsMFAEnabled] = useState(false)
  const [lastProfileFetch, setLastProfileFetch] = useState<number>(0)
  const [profileCache, setProfileCache] = useState<Map<string, { profile: Profile; timestamp: number }>>(new Map())

  // Cache duration: 5 minutes
  const PROFILE_CACHE_DURATION = 5 * 60 * 1000

  // Fetch user profile with caching
  const fetchProfile = async (userId: string, forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && profileCache.has(userId)) {
      const cached = profileCache.get(userId)!
      const now = Date.now()
      if (now - cached.timestamp < PROFILE_CACHE_DURATION) {
        console.log('Using cached profile for user:', userId)
        setProfile(cached.profile)
        return
      }
    }

    // Prevent duplicate requests
    if (profileLoading) {
      console.log('Profile fetch already in progress, skipping...')
      return
    }

    try {
      setProfileLoading(true)
      console.log('Fetching profile for user:', userId)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as { data: Profile | null; error: Error | null }

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
        
        // Cache the profile
        setProfileCache(prev => new Map(prev.set(userId, { 
          profile: data, 
          timestamp: Date.now() 
        })))
        setLastProfileFetch(Date.now())
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Initialize auth state - Official Supabase Pattern
  useEffect(() => {
    console.log('AuthContext: Initializing auth state')

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Initial session:', session ? 'exists' : 'null')
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('AuthContext: User found, fetching profile')
        await fetchProfile(session.user.id)
        setIsMFAEnabled(hasMFAEnabled(session.user))
      } else {
        console.log('AuthContext: No user found')
        setIsMFAEnabled(false)
      }
      console.log('AuthContext: Setting loading to false')
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session ? 'session exists' : 'no session')
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Only fetch profile if user changed or it's a sign in event
        const shouldFetchProfile = event === 'SIGNED_IN' || 
          (user && user.id !== session.user.id) ||
          !profileCache.has(session.user.id)
        
        if (shouldFetchProfile) {
          console.log('AuthContext: User found in state change, fetching profile')
          await fetchProfile(session.user.id)
        } else {
          console.log('AuthContext: Using existing profile for user')
          // Use cached profile if available
          if (profileCache.has(session.user.id)) {
            const cached = profileCache.get(session.user.id)!
            setProfile(cached.profile)
          }
        }
        setIsMFAEnabled(hasMFAEnabled(session.user))
      } else {
        console.log('AuthContext: No user in state change, clearing profile')
        setProfile(null)
        setIsMFAEnabled(false)
        // Clear cache when user signs out
        setProfileCache(new Map())
      }
      console.log('AuthContext: Setting loading to false after state change')
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check session validity periodically (30-day limit)
  useEffect(() => {
    if (!user) return

    const sessionCheckInterval = setInterval(async () => {
      const isValid = await isSessionValid()
      if (!isValid) {
        // Session expired after 30 days, sign out user
        console.log('Session expired after 30 days, signing out user')
        setUser(null)
        setSession(null)
        setProfile(null)
        setProfileCache(new Map())
      }
    }, 60000) // Check every minute

    return () => clearInterval(sessionCheckInterval)
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
      // Clear local state first
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Clear profile cache
      if (profileCache) {
        profileCache.clear()
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        return { error }
      }
      
      console.log('Successfully signed out')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as AuthError }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      // @ts-ignore - Profile update type mismatch
      const { error } = await supabase
        .from('profiles')
        .update(updates)
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
      console.log('Refreshing profile for user:', user.id)
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