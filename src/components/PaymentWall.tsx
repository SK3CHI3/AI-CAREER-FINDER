import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, CreditCard, Smartphone, Shield, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Declare IntaSend types for TypeScript
declare global {
  interface Window {
    IntaSend: any
  }
}

interface PaymentWallProps {
  onPaymentSuccess: () => void
}

const PaymentWall: React.FC<PaymentWallProps> = ({ onPaymentSuccess }) => {
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isIntaSendLoaded, setIsIntaSendLoaded] = useState(false)

  // Load IntaSend SDK
  useEffect(() => {
    const loadIntaSend = async () => {
      try {
        // Load IntaSend script
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/[email protected]/build/intasend-inline.js'
        script.async = true
        script.onload = () => {
          setIsIntaSendLoaded(true)
          initializeIntaSend()
        }
        script.onerror = () => {
          setError('Failed to load payment system. Please refresh the page.')
        }
        document.head.appendChild(script)
      } catch (err) {
        console.error('Error loading IntaSend:', err)
        setError('Failed to initialize payment system.')
      }
    }

    loadIntaSend()
  }, [])

  const initializeIntaSend = () => {
    if (!window.IntaSend) return

    try {
      new window.IntaSend({
        publicAPIKey: import.meta.env.VITE_INTASEND_PUBLIC_KEY || 'test_pk_123456789',
        live: import.meta.env.VITE_INTASEND_LIVE === 'true' // Set to true for production
      })
      .on("COMPLETE", (results: any) => {
        console.log("Payment completed:", results)
        handlePaymentSuccess(results)
      })
      .on("FAILED", (results: any) => {
        console.log("Payment failed:", results)
        handlePaymentFailure(results)
      })
      .on("IN-PROGRESS", (results: any) => {
        console.log("Payment in progress:", results)
        setPaymentStatus('processing')
      })
    } catch (err) {
      console.error('Error initializing IntaSend:', err)
      setError('Failed to initialize payment system.')
    }
  }

  const handlePaymentSuccess = async (results: any) => {
    try {
      setIsLoading(true)
      setPaymentStatus('success')
      
      // Update user profile with payment details
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          payment_status: 'completed',
          payment_reference: results.reference || `PAY_${Date.now()}`,
          payment_date: new Date().toISOString(),
          payment_amount: 1000.00,
          payment_currency: 'KES',
          intasend_transaction_id: results.transaction_id || results.id
        })
        .eq('id', user?.id)

      if (updateError) {
        console.error('Error updating payment status:', updateError)
        setError('Payment successful but failed to update profile. Please contact support.')
        return
      }

      // Show success message briefly then redirect
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000)

    } catch (err) {
      console.error('Error handling payment success:', err)
      setError('Payment successful but failed to update profile. Please contact support.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentFailure = (results: any) => {
    setPaymentStatus('failed')
    setError(results.message || 'Payment failed. Please try again.')
    setIsLoading(false)
  }

  const handleRetryPayment = () => {
    setPaymentStatus('idle')
    setError(null)
  }

  if (!isIntaSendLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading payment system...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Registration
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Unlock full access to AI Career Finder with a one-time payment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Redirecting to your dashboard...
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Payment failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'processing' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                Processing your payment... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                One-time Payment
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">AI Career Finder Access</span>
                <span className="font-semibold">KSh 1,000</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Includes:</span>
                <span>Lifetime access</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">KSh 1,000</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">What you'll get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">AI Career Assessment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Personalized Recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Academic Performance Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Course Recommendations</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            {paymentStatus === 'failed' && (
              <Button 
                onClick={handleRetryPayment}
                variant="outline" 
                className="w-full"
              >
                Try Again
              </Button>
            )}

            {paymentStatus !== 'success' && (
              <button
                className="intaSendPayButton w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-amount="1000"
                data-currency="KES"
                data-email={profile?.email || user?.email}
                data-first_name={profile?.full_name?.split(' ')[0] || ''}
                data-last_name={profile?.full_name?.split(' ').slice(1).join(' ') || ''}
                data-api_ref={`PAY_${user?.id}_${Date.now()}`}
                data-comment="AI Career Finder - Lifetime Access"
                data-method="" // Allow all payment methods
                data-card_tarrif="BUSINESS-PAYS"
                data-mobile_tarrif="BUSINESS-PAYS"
                disabled={isLoading || paymentStatus === 'processing'}
              >
                {isLoading || paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay KSh 1,000 Now
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by IntaSend. We accept M-Pesa, Visa, Mastercard, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentWall
