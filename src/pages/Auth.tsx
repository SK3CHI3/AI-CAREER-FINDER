import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPathForRole } from '@/types/roles'
import { useSearchParams } from 'react-router-dom'

type AuthMode = 'login' | 'signup'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login'
  const defaultRole = searchParams.get('role') as 'student' | 'school' | null

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const { user, profile, loading, profileLoading, profileError } = useAuth()

  // Show loading state
  if (loading || (user && profileLoading && !profileError)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-homepage)' }}>
        <div className="text-center">
          <img 
            src="/logos/CareerGuide_Logo.png" 
            alt="CareerGuide AI" 
            className="h-12 w-auto animate-pulse drop-shadow-md mx-auto mb-4"
          />
          <p className="text-primary/60 text-xs font-medium uppercase tracking-widest animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  // Redirect if already authenticated
  if (user && profile) {
    return <Navigate to={getDashboardPathForRole(profile.role as any)} replace />
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm onToggleMode={() => setMode('signup')} />
        )
      case 'signup':
        return (
          <SignupForm
            onToggleMode={() => setMode('login')}
            defaultRole={defaultRole || 'student'}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-homepage)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/logos/CareerGuide_Logo.png"
              alt="CareerGuide AI"
              className="h-14 w-auto drop-shadow-sm"
            />
          </div>
          <p className="text-foreground-muted">
            AI-Powered Career Guidance for Kenya's CBE System
          </p>
        </div>

        {/* Auth Form */}
        {renderForm()}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-foreground-muted">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
