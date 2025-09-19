import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PaymentWall from './PaymentWall'
import { ProfileSetup } from './ProfileSetup'
import { Loader2 } from 'lucide-react'

interface PaymentGateProps {
  children: React.ReactNode
}

const PaymentGate: React.FC<PaymentGateProps> = ({ children }) => {
  const { user, profile, loading, refreshProfile } = useAuth()
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user || !profile) {
        setIsChecking(false)
        return
      }

      try {
        // Check if profile is complete
        const profileComplete = checkProfileCompletion(profile)
        setIsProfileComplete(profileComplete)

        if (profileComplete) {
          // Check payment status
          const paymentComplete = profile.payment_status === 'completed'
          console.log('Payment status check:', { 
            payment_status: profile.payment_status, 
            paymentComplete 
          })
          setIsPaymentComplete(paymentComplete)
        }

      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserStatus()
  }, [user, profile])

  // Separate effect to refresh profile when it's complete but payment is pending
  useEffect(() => {
    const refreshPaymentStatus = async () => {
      if (user && profile && isProfileComplete && !isPaymentComplete) {
        console.log('Profile complete but payment pending, refreshing profile...')
        await refreshProfile()
      }
    }

    refreshPaymentStatus()
  }, [user, profile, isProfileComplete, isPaymentComplete, refreshProfile])

  const checkProfileCompletion = (profile: any): boolean => {
    const requiredFields = [
      'full_name',
      'school_level',
      'current_grade',
      'cbe_subjects',
      'career_interests'
    ]

    // Check basic required fields
    const basicFieldsComplete = requiredFields.every(field => {
      const value = profile[field]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && value.trim() !== ''
    })

    // Additional validation for CBE subjects
    const cbeSubjectsComplete = profile.cbe_subjects && 
      Array.isArray(profile.cbe_subjects) && 
      profile.cbe_subjects.length >= 3 // Minimum 3 CBE subjects required

    // Additional validation for career interests
    const careerInterestsComplete = profile.career_interests && 
      Array.isArray(profile.career_interests) && 
      profile.career_interests.length >= 2 // Minimum 2 career interests required

    return basicFieldsComplete && cbeSubjectsComplete && careerInterestsComplete
  }

  const handleProfileComplete = () => {
    setIsProfileComplete(true)
    // Payment status will be checked in the next render
  }

  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true)
  }

  // Show loading while checking user status
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  // Show profile setup if profile is incomplete
  if (!isProfileComplete) {
    return <ProfileSetup onComplete={handleProfileComplete} />
  }

  // Show payment wall if profile is complete but payment is not
  if (!isPaymentComplete) {
    return <PaymentWall onPaymentSuccess={handlePaymentSuccess} />
  }

  // Show main app if everything is complete
  return <>{children}</>
}

export default PaymentGate
