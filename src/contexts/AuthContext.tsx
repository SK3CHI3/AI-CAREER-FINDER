// Production-Ready Auth Context - Official Supabase Pattern
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getJWTClaims, hasMFAEnabled, validateJWTForSensitiveOperation } from '@/lib/auth-utils'

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
  isMFAEnabled: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
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
  const [isMFAEnabled, setIsMFAEnabled] = useState(false)

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
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

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
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
        console.log('AuthContext: User found in state change, fetching profile')
        await fetchProfile(session.user.id)
        setIsMFAEnabled(hasMFAEnabled(session.user))
      } else {
        console.log('AuthContext: No user in state change, clearing profile')
        setProfile(null)
        setIsMFAEnabled(false)
      }
      console.log('AuthContext: Setting loading to false after state change')
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
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
    isMFAEnabled,
    signUp,
    signIn,
    signOut,
    updateProfile,
    validateForSensitiveOperation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}