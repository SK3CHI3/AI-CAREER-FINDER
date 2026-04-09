import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ShieldCheck, GraduationCap, Building2 } from 'lucide-react'
import { schoolService } from '@/lib/school-service'
import PaymentWall from './PaymentWall'
import { ProfileSetup } from './ProfileSetup'
import { Loader2 } from 'lucide-react'
import { subscriptionService } from '@/lib/subscription-service'

interface PaymentGateProps {
  children: React.ReactNode
}

const PaymentGate: React.FC<PaymentGateProps> = ({ children }) => {
  const { user, profile, loading: authLoading } = useAuth() // Renamed to avoid conflict
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)
  const [isSchoolSubscribed, setIsSchoolSubscribed] = useState<boolean>(false) // New state
  const [isChecking, setIsChecking] = useState(true)
  const [isPaid, setIsPaid] = useState<boolean | null>(null) // New state, for individual payment

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user || !profile || authLoading) { // Use authLoading here
        setIsChecking(false)
        return
      }

      try {
        // Check if profile is complete - this should be a one-time check
        const profileComplete = checkProfileCompletion(profile)
        setIsProfileComplete(profileComplete)

        if (profileComplete) {
          const status = await subscriptionService.checkSubscriptionStatus(profile)
          
          setIsPaid(status.isActive || profile.role === 'admin')
          setIsPaymentComplete(status.type === 'individual' || status.type === 'institutional')
          setIsSchoolSubscribed(status.type === 'institutional' || (status.type === 'trial' && !!profile.school_id))
        } else {
          // Profile is not complete, reset payment and subscription states
          setIsPaymentComplete(false)
          setIsPaid(false)
          setIsSchoolSubscribed(false)
        }

      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserStatus()
  }, [user?.id, profile?.id, authLoading]) // Depend on IDs and authLoading state

  const checkProfileCompletion = (profile: {
    full_name?: string | null;
    school_level?: string | null;
    cbe_subjects?: string[] | null;
    career_interests?: string[] | null;
    [key: string]: any;
  }): boolean => {
    // Required fields (current_grade is optional)
    const requiredFields = [
      'full_name',
      'school_level',
      'cbe_subjects',
      'career_interests'
    ]

    // Check basic required fields
    const basicFieldsComplete = requiredFields.every(field => {
      const value = profile[field]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && typeof value === 'string' && value.trim() !== ''
    })

    // Additional validation for CBE subjects
    const cbeSubjectsComplete = profile.cbe_subjects &&
      Array.isArray(profile.cbe_subjects) &&
      profile.cbe_subjects.length >= 3 // Minimum 3 CBE subjects required

    // Additional validation for career interests
    const careerInterestsComplete = profile.career_interests &&
      Array.isArray(profile.career_interests) &&
      profile.career_interests.length >= 1 // Minimum 1 career interest required (updated for v2.3.2)

    console.log('Profile completion check details:', {
      basicFieldsComplete,
      cbeSubjectsComplete,
      careerInterestsComplete,
      cbeSubjectsLength: Array.isArray(profile.cbe_subjects) ? profile.cbe_subjects.length : 0,
      careerInterestsLength: Array.isArray(profile.career_interests) ? profile.career_interests.length : 0
    })

    return basicFieldsComplete && cbeSubjectsComplete && careerInterestsComplete
  }

  const handleProfileComplete = (paymentStatus: boolean) => {
    console.log('Profile completion callback triggered with payment status:', paymentStatus)
    setIsProfileComplete(true)
    setIsPaymentComplete(paymentStatus)
    setIsPaid(paymentStatus || profile?.role === 'admin' || profile?.role === 'school') // Update isPaid based on callback
    // Re-check school subscription if profile was just completed and school_id exists
    if (profile?.school_id) {
      const recheckSchoolSubscription = async () => {
        try {
          const hasSub = await schoolService.hasActiveSubscription(profile.school_id)
          setIsSchoolSubscribed(hasSub)
        } catch (error) {
          console.error('Failed to parse saved conversation:', error);
          setIsSchoolSubscribed(false)
        }
      }
      recheckSchoolSubscription()
    }
  }

  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true)
    setIsPaid(true) // Individual payment is now complete
  }

  // Show loading while checking user status
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
        <img 
          src="/logos/CareerGuide_Logo.png" 
          alt="CareerGuide AI" 
          className="h-10 w-auto animate-pulse drop-shadow-md"
        />
      </div>
    )
  }

  // Show profile setup if profile is incomplete
  if (!isProfileComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />
  }

  // Students now always proceed to the dashboard after profile setup (v2.3.5)
  // Individual payment prompts will now appear inside the dashboard as alerts/banners.
  return <>{children}</>

  // Show main app if everything is complete
  return <>{children}</>
}

export default PaymentGate
