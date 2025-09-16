// User Activity Tracking Hook
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { dashboardService } from '@/lib/dashboard-service'

export interface ActivityTrackingOptions {
  trackPageViews?: boolean
  trackClicks?: boolean
  trackScroll?: boolean
  trackTimeOnPage?: boolean
  trackFormInteractions?: boolean
}

export const useActivityTracking = (options: ActivityTrackingOptions = {}) => {
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const pageViewCountRef = useRef<number>(0)
  const clickCountRef = useRef<number>(0)
  const scrollDepthRef = useRef<number>(0)
  const maxScrollDepthRef = useRef<number>(0)

  const {
    trackPageViews = true,
    trackClicks = true,
    trackScroll = true,
    trackTimeOnPage = true,
    trackFormInteractions = true
  } = options

  // Start tracking session
  useEffect(() => {
    if (!user || isTracking) return

    const startSession = async () => {
      try {
        const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        const browser = navigator.userAgent.split(' ').pop() || 'unknown'
        
        const session = await dashboardService.startUserSession(
          user.id,
          deviceType,
          browser
        )
        
        setSessionId(session.id)
        setIsTracking(true)
        startTimeRef.current = Date.now()
      } catch (error) {
        console.error('Failed to start activity tracking session:', error)
      }
    }

    startSession()

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        endSession()
      }
    }
  }, [user, isTracking])

  // Track page views
  useEffect(() => {
    if (!trackPageViews || !isTracking) return

    pageViewCountRef.current += 1
    
    if (sessionId) {
      dashboardService.updateSessionActivity(sessionId, pageViewCountRef.current)
    }
  }, [trackPageViews, isTracking, sessionId])

  // Track clicks
  useEffect(() => {
    if (!trackClicks || !isTracking) return

    const handleClick = () => {
      clickCountRef.current += 1
      
      if (sessionId) {
        dashboardService.updateSessionActivity(sessionId, undefined, clickCountRef.current)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [trackClicks, isTracking, sessionId])

  // Track scroll depth
  useEffect(() => {
    if (!trackScroll || !isTracking) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)
      
      scrollDepthRef.current = scrollPercentage
      maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, scrollPercentage)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScroll, isTracking])

  // Track form interactions
  useEffect(() => {
    if (!trackFormInteractions || !isTracking) return

    const handleFormInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Track form field interactions
        trackActivity('form_interaction', 'Form Field Interaction', `Interacted with ${target.tagName.toLowerCase()}`)
      }
    }

    document.addEventListener('focus', handleFormInteraction, true)
    return () => document.removeEventListener('focus', handleFormInteraction, true)
  }, [trackFormInteractions, isTracking])

  // End session when user leaves
  useEffect(() => {
    if (!isTracking) return

    const handleBeforeUnload = () => {
      endSession()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isTracking])

  const endSession = async () => {
    if (!sessionId) return

    try {
      await dashboardService.endUserSession(sessionId)
      setIsTracking(false)
      setSessionId(null)
    } catch (error) {
      console.error('Failed to end activity tracking session:', error)
    }
  }

  const trackActivity = async (
    activityType: string,
    title: string,
    description: string,
    data?: any,
    progress?: number
  ) => {
    if (!user || !isTracking) return

    try {
      await dashboardService.createUserActivity({
        user_id: user.id,
        activity_type: activityType,
        activity_title: title,
        activity_description: description,
        activity_data: data,
        progress_percentage: progress || 0
      })
    } catch (error) {
      console.error('Failed to track activity:', error)
    }
  }

  const trackPageView = (pageName: string) => {
    trackActivity('page_view', `Viewed ${pageName}`, `User navigated to ${pageName}`)
  }

  const trackButtonClick = (buttonName: string, context?: string) => {
    trackActivity('button_click', `Clicked ${buttonName}`, `User clicked ${buttonName}${context ? ` in ${context}` : ''}`)
  }

  const trackFormSubmission = (formName: string, success: boolean) => {
    trackActivity(
      'form_submission',
      `${success ? 'Successfully submitted' : 'Failed to submit'} ${formName}`,
      `Form submission ${success ? 'completed' : 'failed'} for ${formName}`,
      { success, formName }
    )
  }

  const trackAssessmentProgress = (assessmentName: string, progress: number) => {
    trackActivity(
      'assessment_progress',
      `Assessment Progress: ${assessmentName}`,
      `Completed ${progress}% of ${assessmentName}`,
      { assessmentName, progress },
      progress
    )
  }

  const trackCareerInterest = (interest: string, action: 'added' | 'removed') => {
    trackActivity(
      'career_interest',
      `${action === 'added' ? 'Added' : 'Removed'} Career Interest`,
      `${action === 'added' ? 'Added' : 'Removed'} interest in ${interest}`,
      { interest, action }
    )
  }

  const trackAIChat = (messageType: 'sent' | 'received', messageLength: number) => {
    trackActivity(
      'ai_chat',
      `AI Chat ${messageType === 'sent' ? 'Message Sent' : 'Response Received'}`,
      `${messageType === 'sent' ? 'Sent' : 'Received'} message (${messageLength} characters)`,
      { messageType, messageLength }
    )
  }

  return {
    isTracking,
    sessionId,
    trackActivity,
    trackPageView,
    trackButtonClick,
    trackFormSubmission,
    trackAssessmentProgress,
    trackCareerInterest,
    trackAIChat,
    endSession
  }
}
