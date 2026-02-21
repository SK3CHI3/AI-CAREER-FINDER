import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPathForRole } from '@/types/roles'
import { Bot } from 'lucide-react'

type AuthMode = 'login' | 'signup'

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const { user, profile, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if already authenticated
  if (user && profile) {
    return <Navigate to={getDashboardPathForRole(profile.role)} replace />
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm onToggleMode={() => setMode('signup')} />
        )
      case 'signup':
        return (
          <SignupForm onToggleMode={() => setMode('login')} />
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
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
              CareerPath AI
            </h1>
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
