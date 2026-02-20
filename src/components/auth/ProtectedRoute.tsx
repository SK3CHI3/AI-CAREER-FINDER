import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Bot, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'admin'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, profile, loading, profileLoading, profileError, refreshProfile, signOut } = useAuth()

  // Show loading state while auth or profile is loading
  if (loading || (user && profileLoading)) {
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

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // If user exists but no profile yet, show loading or error
  if (user && !profile) {
    if (profileError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-foreground font-medium mb-1">Could not load profile</p>
            <p className="text-foreground-muted text-sm mb-4">{profileError.message}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => refreshProfile()}>
                Retry
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await signOut()
                  window.location.href = '/auth'
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-foreground-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Check role requirement
  if (requiredRole && profile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = profile.role === 'admin' ? '/admin' : '/student'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
