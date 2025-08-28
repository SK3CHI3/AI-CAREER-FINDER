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

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Redirect to auth if no profile (shouldn't happen with trigger, but safety check)
  if (!profile) {
    return <Navigate to="/auth" replace />
  }

  // Check role requirement
  if (requiredRole && profile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = profile.role === 'admin' ? '/admin' : '/student'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
