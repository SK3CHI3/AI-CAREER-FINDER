import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Bot } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'student' | 'admin'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, profile, loading, profileLoading } = useAuth()

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

  // If user exists but no profile yet, show loading (profile is being fetched in background)
  if (user && !profile) {
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
