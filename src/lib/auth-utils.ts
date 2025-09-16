// JWT Claims Validation Utilities
import { User } from '@supabase/supabase-js'

export interface JWTClaims {
  iss: string
  aud: string | string[]
  exp: number
  iat: number
  sub: string
  role: string
  aal: 'aal1' | 'aal2'
  session_id: string
  email: string
  phone: string
  is_anonymous: boolean
  jti?: string
  nbf?: number
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
  amr?: Array<{
    method: string
    timestamp: number
  }>
  ref?: string // Only in anon/service role tokens
}

/**
 * Extract JWT claims from user object
 */
export function getJWTClaims(user: User | null): JWTClaims | null {
  if (!user) return null
  
  try {
    // Access token is stored in the user object
    const token = (user as any).access_token
    if (!token) return null

    // Decode JWT payload (base64url decode)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload as JWTClaims
  } catch (error) {
    console.error('Error decoding JWT claims:', error)
    return null
  }
}

/**
 * Check if user has MFA enabled (AAL2)
 */
export function hasMFAEnabled(user: User | null): boolean {
  const claims = getJWTClaims(user)
  return claims?.aal === 'aal2' || false
}

/**
 * Check if JWT is expired
 */
export function isJWTExpired(user: User | null): boolean {
  const claims = getJWTClaims(user)
  if (!claims) return true
  
  const now = Math.floor(Date.now() / 1000)
  return claims.exp < now
}

/**
 * Get authentication methods used
 */
export function getAuthenticationMethods(user: User | null): string[] {
  const claims = getJWTClaims(user)
  return claims?.amr?.map(method => method.method) || []
}

/**
 * Check if user recently authenticated with password
 */
export function recentlyAuthenticatedWithPassword(user: User | null, maxAgeMinutes: number = 30): boolean {
  const claims = getJWTClaims(user)
  if (!claims?.amr) return false

  const now = Math.floor(Date.now() / 1000)
  const maxAge = maxAgeMinutes * 60

  return claims.amr.some(method => 
    method.method === 'password' && 
    (now - method.timestamp) <= maxAge
  )
}

/**
 * Validate JWT for security-sensitive operations
 */
export function validateJWTForSensitiveOperation(user: User | null): {
  isValid: boolean
  reason?: string
} {
  if (!user) {
    return { isValid: false, reason: 'No user session' }
  }

  if (isJWTExpired(user)) {
    return { isValid: false, reason: 'JWT expired' }
  }

  const claims = getJWTClaims(user)
  if (!claims) {
    return { isValid: false, reason: 'Invalid JWT claims' }
  }

  // Check if user is anonymous
  if (claims.is_anonymous) {
    return { isValid: false, reason: 'Anonymous users not allowed' }
  }

  // Check role
  if (claims.role !== 'authenticated') {
    return { isValid: false, reason: 'Invalid user role' }
  }

  return { isValid: true }
}
