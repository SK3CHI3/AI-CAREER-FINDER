import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { RIASEC_LABELS } from '@/data/riasec-assessment'
import {
  User,
  BookOpen,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  Bot,
  BarChart3,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  ChevronRight,
  Star,
  Loader2,
  GraduationCap,
  Briefcase,
  Brain,
  Zap,
  Trophy,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Activity,
  BookMarked,
  DollarSign,
  Lock,
  XCircle,
  Lightbulb,
  RefreshCw,
  School
} from 'lucide-react'
import PaymentWall from '@/components/PaymentWall'
import { ThemeToggle } from '@/components/ThemeToggle'
import AIChat from '@/components/AIChat'
import { ReportGenerator } from '@/lib/report-generator'
import { ProfileSetup } from '@/components/ProfileSetup'
import GradesManager from '@/components/GradesManager'
import CareerDetailModal from '@/components/CareerDetailModal'
import CourseRecommendations from '@/components/CourseRecommendations'
import GradesModal from '@/components/GradesModal'
import { supabase } from '@/lib/supabase'
import { aiCareerService } from '@/lib/ai-service'
import { aiCacheService } from '@/lib/ai-cache-service'
import { dashboardService, UserStat, UserActivity, CareerRecommendation } from '@/lib/dashboard-service'
import { useActivityTracking } from '@/hooks/useActivityTracking'

// Default career data - will be replaced with AI recommendations
interface CareerDataItem {
  name: string
  value: number
  color: string
  description?: string
  salaryRange?: string
  growth?: string
  education?: string
  actionabilityScore?: number
}



const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [careerData, setCareerData] = useState<CareerDataItem[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [dynamicStats, setDynamicStats] = useState<UserStat[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [selectedCareer, setSelectedCareer] = useState<CareerDataItem | null>(null)
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false)
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false)
  const [isSchoolSubscribed, setIsSchoolSubscribed] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [isPaymentWallOpen, setIsPaymentWallOpen] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; status: string } | null>(null)

  // Activity tracking
  const { trackPageView, trackButtonClick, trackAIChat } = useActivityTracking({
    trackPageViews: true,
    trackClicks: true,
    trackScroll: true,
    trackTimeOnPage: true,
    trackFormInteractions: true
  })

  // Load data when component mounts (user and profile guaranteed by ProtectedRoute)
  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
      checkAccessStatus();
      trackPageView('Student Dashboard');
    }
  }, [user, profile])

  const checkAccessStatus = async () => {
    if (!profile) return;
    const paid = profile.payment_status === 'completed';
    setIsPaid(paid);

    if (profile.school_id) {
      try {
        const { schoolService } = await import('@/lib/school-service');
        const [hasSub, schoolData] = await Promise.all([
          schoolService.hasActiveSubscription(profile.school_id),
          schoolService.getSchoolById(profile.school_id)
        ]);
        
        setIsSchoolSubscribed(hasSub);
        if (schoolData) {
          setSchoolInfo({ name: schoolData.name, status: schoolData.status || 'active' });
        }
      } catch (err) {
        console.error('Error checking school status:', err);
      }
    }
  }

  const isAuthorized = isPaid || isSchoolSubscribed;

  // Load all dashboard data
  const loadDashboardData = async () => {
    if (!user || !profile) return;

    try {
      setIsLoadingStats(true);

      // Load user stats
      const stats = await dashboardService.calculateUserStats(user.id, profile);

      setDynamicStats(stats);

      // Load career recommendations
      await loadCareerRecommendations(profile);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Calculate profile completeness percentage
  const calculateProfileCompleteness = (profileData: any) => {
    const fields = [
      'school_level',
      'current_grade',
      'cbe_subjects',
      'career_interests',
      'career_goals',
      'strengths',
      'challenges'
    ];

    const completedFields = fields.filter(field => {
      const value = profileData[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
    });

    return Math.round((completedFields.length / fields.length) * 100);
  };


  // Fetch AI-powered insights for the dashboard
  const fetchAIInsights = async () => {
    if (!profile || !user) return;

    try {
      const userContext = {
        name: profile?.full_name || undefined,
        schoolLevel: profile.school_level,
        currentGrade: profile.current_grade || undefined,
        subjects: profile.cbe_subjects || profile.subjects || undefined,
        interests: profile.career_interests || profile.interests || undefined,
        careerGoals: profile.career_goals || undefined
      };

      // Get AI insights for dashboard personalization
      const insights = await aiCareerService.sendMessage(
        `Based on this student profile, provide 3 personalized insights for their dashboard in JSON format:
        {
          "weeklyTip": "One actionable tip for this week",
          "nextStep": "Most important next step in their career journey",
          "motivation": "Encouraging message based on their progress"
        }`,
        [],
        userContext
      );

      try {
        const parsedInsights = JSON.parse(insights);
        // You can use these insights to enhance the dashboard further
        console.log('AI Insights:', parsedInsights);
      } catch (e) {
        console.log('Could not parse AI insights, using defaults');
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  // ProtectedRoute handles loading and authentication checks



  const loadCareerRecommendations = async (profileData: any) => {
    if (!user) return;

    if (import.meta.env.DEV) {
      console.log('🤖 loadCareerRecommendations started with profile:', {
        school_level: profileData.school_level,
        current_grade: profileData.current_grade,
        subjects: profileData.cbe_subjects || profileData.subjects,
        interests: profileData.career_interests || profileData.interests
      });
    }

    setIsLoadingRecommendations(true);

    try {
      // First, try to get cached recommendations
      console.log('🔍 Checking for cached career recommendations...');
      const cachedRecommendations = await aiCacheService.getCachedCareerRecommendations(user.id);

      if (cachedRecommendations && cachedRecommendations.length > 0) {
        console.log('✅ Using cached career recommendations:', cachedRecommendations.length);

        // Convert cached data to chart format
        const top3 = cachedRecommendations.slice(0, 3).map((rec, index) => ({
          name: rec.career_name,
          value: rec.match_percentage,
          color: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
          description: rec.description || "Exciting career opportunity aligned with your interests and skills.",
          salaryRange: rec.salary_range || 'KES 40K - 100K',
          growth: rec.growth || 'Moderate Growth',
          education: rec.education || "Bachelor's Degree or Diploma Required",
          actionabilityScore: rec.actionability_score || 85
        }));

        setCareerData(top3);
        console.log('✅ Cached career recommendations loaded');
        return;
      }

      // No cached data, generate fresh recommendations
      console.log('🤖 No cached data found, generating fresh career recommendations with AI...');

      // Get academic performance data
      const academicPerformance = await dashboardService.calculateAcademicPerformance(user.id);
      console.log('📊 Academic performance data:', academicPerformance);

      const userContext = {
        name: profile?.full_name || undefined,
        schoolLevel: profileData.school_level,
        currentGrade: profileData.current_grade || undefined,
        subjects: profileData.cbe_subjects || profileData.subjects || undefined,
        interests: profileData.career_interests || profileData.interests || undefined,
        careerGoals: profileData.career_goals || undefined,
        assessmentResults: profileData.assessment_results,
        academicPerformance: {
          overallAverage: academicPerformance.overallAverage,
          strongSubjects: academicPerformance.strongSubjects,
          weakSubjects: academicPerformance.weakSubjects,
          performanceTrend: academicPerformance.performanceTrend
        }
      }

      // Generate AI recommendations
      const recommendations = await aiCareerService.generateCareerRecommendations(userContext) as any[];

      if (recommendations && recommendations.length > 0) {
        // Save recommendations to cache
        await aiCacheService.saveCareerRecommendations(user.id, recommendations);
        console.log('💾 Career recommendations saved to cache');

        // Update chart data
        const top3 = recommendations.slice(0, 3).map((rec, index) => ({
          name: rec.title,
          value: rec.matchPercentage,
          color: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
          description: rec.description || "Exciting career opportunity aligned with your interests and skills.",
          salaryRange: rec.salaryRange || 'KES 40K - 100K',
          growth: rec.growth || 'Moderate Growth',
          education: rec.education || "Bachelor's Degree or Diploma Required",
          actionabilityScore: rec.actionabilityScore || 80
        }));

        setCareerData(top3);
        console.log('✅ Fresh career recommendations generated and cached');

        // Track the AI recommendation generation
        trackButtonClick('AI Career Recommendations Generated', 'Dashboard');
      } else {
        setCareerData([]);
      }
    } catch (error) {
      console.error('Failed to load career recommendations:', error);
      setCareerData([]);
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleRefreshRecommendations = async () => {
    if (!profile || !user) return;
    try {
      // Invalidate cache first
      await aiCacheService.invalidateCache(user.id, 'career_recommendations', 'manually_refreshed');
      // Load fresh
      await loadCareerRecommendations(profile);
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }

  // RIASEC Data for Chart
  const riasecChartData = profile?.assessment_results?.riasec_scores ?
    Object.entries(profile.assessment_results.riasec_scores).map(([key, value]) => ({
      subject: RIASEC_LABELS[key] || key,
      A: value,
      fullMark: 5, // Assuming max 5 activities selected per type
    })) : []

  const dominantType = profile?.assessment_results?.personality_type || 'Discovery Pending'



  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Sign out failed:', error)
        // Still redirect to login even if there's an error
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'S'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 604800)}w ago`
  }

  const handleCareerDetailClick = (career: CareerDataItem) => {
    setSelectedCareer(career)
    setIsCareerModalOpen(true)
    trackButtonClick('View Career Details', 'Career Card')
  }

  // Function to invalidate cache when grades are updated
  const handleGradesUpdated = async () => {
    if (user?.id && profile) {
      console.log('🔄 Grades updated, invalidating AI caches')
      await aiCacheService.invalidateAllCaches(user.id, 'grades_updated')

      // Reload career recommendations with fresh data
      await loadCareerRecommendations(profile)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Match: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  // At this point, user and profile are guaranteed by ProtectedRoute
  // Render the dashboard directly



  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-page-subtle)' }}>
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logos/CareerGuide_Logo.png"
                alt="CareerGuide AI"
                className="h-10 w-auto"
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name || 'Student'}
                  </p>
                  <Badge className="bg-primary text-primary-foreground">
                    Student
                  </Badge>
                </div>
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!isAuthorized && (
          <div className="mb-8 p-6 rounded-[2.5rem] bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 border-2 border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Unlock Your Full Career Potential! 🚀</h3>
                  <p className="text-foreground-muted text-base sm:text-lg">Get personalized AI guidance, detailed reports, and expert career mapping for just <span className="text-primary font-bold">KSh 10</span>.</p>
                </div>
              </div>
                <Button 
                onClick={() => setIsPaymentWallOpen(true)}
                className="h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold w-full md:w-auto transition-transform hover:scale-105"
              >
                Unlock Premium Now (10 KES)
              </Button>
            </div>
          </div>
        )}
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-3">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
                <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-foreground-muted text-base sm:text-lg">
                Continue your career discovery journey and unlock your potential.
              </p>
            </div>

          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="careers" className="relative">
                  Careers
                  {careerData.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
                </TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 w-full">
              {isLoadingStats ? (
                // Loading skeleton for stats
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                dynamicStats.map((stat, index) => {
                  const statConfig = {
                    'profile_completeness': { title: 'Profile Complete', icon: User, color: 'text-green-600', bgColor: 'bg-green-100' },
                    'career_matches': { title: 'Career Matches', icon: Target, color: 'text-blue-600', bgColor: 'bg-blue-100' },
                    'ai_sessions': { title: 'AI Sessions', icon: Bot, color: 'text-purple-600', bgColor: 'bg-purple-100' },
                    'learning_hours': { title: 'Learning Hours', icon: BookMarked, color: 'text-orange-600', bgColor: 'bg-orange-100' }
                  }[stat.stat_type] || { title: stat.stat_type, icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' };

                  const IconComponent = statConfig.icon;

                  return (
                    <Card key={stat.id} className="bg-card border-card-border hover:shadow-card transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardDescription className="text-sm font-medium">{statConfig.title}</CardDescription>
                            <CardTitle className="text-3xl font-bold mt-1">{stat.stat_value}</CardTitle>
                            <p className={`text-xs flex items-center gap-1 mt-1 ${stat.stat_trend === 'up' ? 'text-green-600' :
                              stat.stat_trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                              <TrendingUp className={`w-3 h-3 ${stat.stat_trend === 'down' ? 'rotate-180' : ''}`} />
                              {stat.stat_change}
                            </p>
                          </div>
                          <div className={`w-12 h-12 rounded-xl ${statConfig.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`w-6 h-6 ${statConfig.color}`} />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6 w-full">
              {/* Career Recommendations Chart */}
              <Card className="col-span-1 lg:col-span-2 bg-card border-card-border overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      <CardTitle>AI Career Recommendations</CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                        DeepSeek-V3 Engine
                      </Badge>
                    </div>
                    <CardDescription>Based on your personality, grades, and Kenyan market reality</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleRefreshRecommendations}
                    disabled={isLoadingRecommendations}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingRecommendations ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingRecommendations ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-foreground-muted">Analyzing your career potential...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={careerData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {careerData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, 'Match']}
                            labelStyle={{ color: 'var(--foreground)' }}
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RIASEC Personality Profile Card */}
              {riasecChartData.length > 0 && (
                <Card className="lg:col-span-1 bg-card border-card-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      Personality Profile
                    </CardTitle>
                    <CardDescription>Your unique RIASEC mix</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] -mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riasecChartData}>
                          <PolarGrid stroke="var(--card-border)" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--foreground-muted)', fontSize: 10 }}
                          />
                          <Radar
                            name="Personality"
                            dataKey="A"
                            stroke="var(--primary)"
                            fill="var(--primary)"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-6 w-full">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-card transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Take Assessment</CardTitle>
                      <CardDescription>Discover your strengths</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-muted mb-4">Complete our comprehensive career assessment to get personalized recommendations.</p>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      trackButtonClick('Start Assessment', 'Action Cards')
                      setActiveTab('chat')
                    }}
                  >
                    Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-card transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Explore CBE Paths</CardTitle>
                      <CardDescription>Plan your pathway</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-muted mb-4">Learn about Senior Secondary pathways and university requirements.</p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      trackButtonClick('Explore Paths', 'Action Cards')
                      setActiveTab('careers')
                    }}
                  >
                    Explore Paths <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-card transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Get AI Guidance</CardTitle>
                      <CardDescription>Chat with our AI</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-muted mb-4">Get personalized career advice from our AI counselor.</p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setActiveTab('chat')
                      trackButtonClick('Start Chat', 'Action Cards')
                    }}
                  >
                    Start Chat <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Careers Tab */}
          <TabsContent value="careers" className="space-y-2 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 w-full">
              {careerData.map((career, index) => (
                <Card key={index} className="bg-card border-card-border hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => handleCareerDetailClick(career)}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Briefcase className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold mb-1">{career.name}</CardTitle>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] h-5">
                                {career.value}% Match
                              </Badge>
                              <div className="flex flex-col gap-1 w-20">
                                <Progress
                                  value={career.value}
                                  className="h-1.5 bg-muted"
                                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                                />
                                <span className="text-[10px] font-medium text-foreground-muted text-right">{career.value}% Match</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] h-5 border-orange-200 text-orange-700 bg-orange-50">
                                {career.actionabilityScore || 85}% Actionable
                              </Badge>
                              <div className="flex flex-col gap-1 w-20">
                                <Progress
                                  value={career.actionabilityScore || 85}
                                  className="h-1.5 bg-muted"
                                  indicatorClassName="bg-orange-400"
                                />
                                <span className="text-[10px] font-medium text-foreground-muted text-right">{career.actionabilityScore || 85}% Actionable</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {career.description || "A promising career path that aligns with your CBE pathway and interests, offering strong growth potential in Kenya's evolving job market."}
                    </p>

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">Salary Range</span>
                        </div>
                        <p className="text-sm font-semibold text-green-700">{career.salaryRange || 'KSh 60K - 200K'}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">Growth</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-700">{career.growth || 'High Growth'}</p>
                      </div>
                    </div>

                    {/* Education Requirement */}
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-800">Education</span>
                      </div>
                      <p className="text-sm text-purple-700">{career.education || "Bachelor's Degree Required"}</p>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
                      onClick={() => {
                        if (isAuthorized) {
                          // Already handled by parent Card? No, let's trigger detail modal
                          handleCareerDetailClick(career)
                        } else {
                          setIsPaymentWallOpen(true)
                        }
                      }}
                    >
                      {isAuthorized ? <Target className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      {isAuthorized ? 'Get Detailed Insights' : 'Unlock Insights'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="w-full mx-auto px-2 sm:px-0">
            {isAuthorized ? (
              <AIChat />
            ) : (
              <Card className="p-12 text-center border-2 border-dashed border-primary/30 bg-primary/5 rounded-[3rem]">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black">AI Career Mentor is Locked</h3>
                  <p className="text-lg text-foreground-muted">Upgrade to Premium to chat with our AI Career Mentor. Get personalized advice on subjects, universities, and your 10 KES one-time payment covers everything!</p>
                  <Button 
                    onClick={() => setIsPaymentWallOpen(true)}
                    className="h-16 px-10 text-xl rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 font-bold"
                  >
                    Unlock for KSh 10
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-2 sm:space-y-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 w-full">
              {/* Free Courses Card */}
              <Card className="w-full bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Recommended Free Courses
                  </CardTitle>
                  <CardDescription>AI-curated courses based on your profile and career interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <CourseRecommendations
                    careerInterests={profile?.career_interests || profile?.interests}
                    cbeSubjects={profile?.cbe_subjects || profile?.subjects}
                    strongSubjects={[]} // This will be populated from grades data
                  />
                </CardContent>
              </Card>

              {/* Journey Actions Card */}
              <Card className="w-full bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Your Journey Actions
                  </CardTitle>
                  <CardDescription>Take action to advance your career path</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors mt-2 sm:mt-0"
                      onClick={() => {
                        setActiveTab('progress')
                        trackButtonClick('View Academic Insights', 'Journey Actions')
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm sm:text-base font-medium">View your academic insights</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-2 sm:mt-0" />
                    </div>
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => {
                        setActiveTab('chat')
                        trackButtonClick('Complete Assessment', 'Journey Actions')
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Complete Skills Assessment</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-green-500" />
                    </div>
                    <div
                      className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => {
                        setActiveTab('careers')
                        trackButtonClick('Explore Programs', 'Journey Actions')
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Explore university programs</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <Button
                      className="w-full min-h-[44px]"
                      onClick={() => {
                        setActiveTab('chat')
                        trackButtonClick('Start Assessment', 'Journey Actions')
                      }}
                    >
                      Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px]"
                      onClick={async () => {
                        if (!isAuthorized) {
                          setIsPaymentWallOpen(true)
                          return
                        }
                        const profileData = profile || ({} as any)
                        const html = ReportGenerator.generatePDFReport(
                          {
                            name: profileData.full_name,
                            grade: profileData.current_grade,
                            subjects: profileData.cbe_subjects || profileData.subjects,
                            interests: profileData.career_interests || profileData.interests,
                            careerGoals: profileData.career_goals,
                            location: profileData.location,
                          },
                          [],
                          []
                        )
                        await ReportGenerator.downloadPDF(html, 'CareerPathAI_Assessment.pdf')
                        trackButtonClick('Download PDF', 'Journey Actions')
                      }}
                    >
                      {isAuthorized ? <FileText className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      {isAuthorized ? 'Download PDF' : 'Unlock Report (10 KES)'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="w-full bg-card border-card-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <CardTitle>Academic Insights</CardTitle>
                </div>
                {schoolInfo && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                    <School className="w-3 h-3" />
                    Verified by {schoolInfo.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <GradesManager readOnly={true} onGradesUpdated={handleGradesUpdated} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Career Detail Modal */}
      {/* Modals and Overlays */}
      {isPaymentWallOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-card rounded-[3rem] shadow-2xl border-2 border-card-border overflow-hidden animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsPaymentWallOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <XCircle className="w-8 h-8 text-foreground-muted" />
              </button>
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="p-2">
                  <PaymentWall onPaymentSuccess={() => {
                    setIsPaymentWallOpen(false);
                    checkAccessStatus();
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCareer && (
        <CareerDetailModal
          isOpen={isCareerModalOpen}
          onClose={() => {
            setIsCareerModalOpen(false)
            setSelectedCareer(null)
          }}
          career={selectedCareer}
          studentProfile={{
            name: profile?.full_name,
            schoolLevel: profile?.school_level,
            currentGrade: profile?.current_grade,
            cbeSubjects: profile?.cbe_subjects || profile?.subjects,
            careerInterests: profile?.career_interests || profile?.interests,
            strongSubjects: [], // This will be populated from grades data
            weakSubjects: [], // This will be populated from grades data
            overallAverage: 0 // This will be populated from grades data
          }}
        />
      )}

      {/* Grades Modal */}
      <GradesModal
        isOpen={isGradesModalOpen}
        onClose={() => setIsGradesModalOpen(false)}
      />
    </div>
  )
}

export default StudentDashboard
