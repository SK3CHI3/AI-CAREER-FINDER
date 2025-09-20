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

  // Fetch user profile - Simple and fast
  const fetchProfile = async (userId: string, forceRefresh = false) => {
    try {
      setProfileLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
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
        console.log('🔐 AuthContext: Starting initialization')
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 AuthContext: Got session:', session ? 'exists' : 'null')

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('🔐 AuthContext: User found, setting MFA and fetching profile')
          setIsMFAEnabled(hasMFAEnabled(session.user))
          // Fetch profile in background - don't wait for it
          fetchProfile(session.user.id).catch(error => {
            console.error('Background profile fetch failed:', error)
          })
        } else {
          console.log('🔐 AuthContext: No user found')
          setIsMFAEnabled(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        // Always set loading to false
        if (mounted) {
          console.log('🔐 AuthContext: Setting loading to false')
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

    const sessionCheckInterval = setInterval(async () => {
      const isValid = await isSessionValid()
      if (!isValid) {
        // Session expired after 30 days, sign out user
        console.log('Session expired after 30 days, signing out user')
        setUser(null)
        setSession(null)
        setProfile(null)
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

      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
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