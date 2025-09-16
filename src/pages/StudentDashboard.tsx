import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
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
  Lightbulb,
  DollarSign
} from 'lucide-react'
import AIChat from '@/components/AIChat'
import { ReportGenerator } from '@/lib/report-generator'
import { ProfileSetup } from '@/components/ProfileSetup'
import GradesManager from '@/components/GradesManager'
import CareerDetailModal from '@/components/CareerDetailModal'
import CourseRecommendations from '@/components/CourseRecommendations'
import GradesModal from '@/components/GradesModal'
import { supabase } from '@/lib/supabase'
import { aiCareerService } from '@/lib/ai-service'
import { dashboardService, UserStat, UserActivity, CareerRecommendation } from '@/lib/dashboard-service'
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { aiCacheService } from '@/lib/ai-cache-service'

// Default career data - will be replaced with AI recommendations
interface CareerDataItem {
  name: string
  value: number
  color: string
  description?: string
  salaryRange?: string
  growth?: string
  education?: string
}

const defaultCareerData: CareerDataItem[] = [
  { name: 'Complete Profile', value: 100, color: '#6b7280' },
  { name: 'Take Assessment', value: 0, color: '#e5e7eb' },
  { name: 'Get AI Guidance', value: 0, color: '#e5e7eb' },
]

const recentActivities = [
  {
    id: 1,
    type: 'assessment',
    title: 'Career Assessment Completed',
    description: 'Discovered your strengths in STEM fields',
    time: '2 hours ago',
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    progress: 100
  },
  {
    id: 2,
    type: 'recommendation',
    title: 'New Career Matches',
    description: '3 new careers aligned with your CBE pathway',
    time: '1 day ago',
    icon: Sparkles,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    progress: 85
  },
  {
    id: 3,
    type: 'chat',
    title: 'AI Career Guidance',
    description: 'Explored university programs and requirements',
    time: '3 days ago',
    icon: Bot,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    progress: 90
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Profile Milestone',
    description: 'Completed 80% of your career profile',
    time: '1 week ago',
    icon: Trophy,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    progress: 80
  },
  {
    id: 5,
    type: 'learning',
    title: 'CBE Pathway Explored',
    description: 'Learned about Senior Secondary options',
    time: '2 weeks ago',
    icon: GraduationCap,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    progress: 75
  }
]

// Quick stats data
const quickStats = [
  {
    id: 1,
    title: 'Career Matches',
    value: '12',
    change: '+3 this week',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    trend: 'up'
  },
  {
    id: 2,
    title: 'Profile Complete',
    value: '85%',
    change: '+15% this month',
    icon: User,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    trend: 'up'
  },
  {
    id: 3,
    title: 'AI Sessions',
    value: '24',
    change: '+8 this week',
    icon: Bot,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    trend: 'up'
  },
  {
    id: 4,
    title: 'Learning Hours',
    value: '47h',
    change: '+12h this week',
    icon: BookMarked,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    trend: 'up'
  }
]

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [careerData, setCareerData] = useState<CareerDataItem[]>(defaultCareerData)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [dynamicStats, setDynamicStats] = useState<UserStat[]>([])
  const [dynamicActivities, setDynamicActivities] = useState<UserActivity[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [selectedCareer, setSelectedCareer] = useState<CareerDataItem | null>(null)
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false)
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false)

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
      trackPageView('Student Dashboard');
    }
  }, [user, profile])

  // Load all dashboard data
  const loadDashboardData = async () => {
    if (!user || !profile) return;

    try {
      setIsLoadingStats(true);
      setIsLoadingActivities(true);

      // Load user stats and activities in parallel
      const [stats, activities] = await Promise.all([
        dashboardService.calculateUserStats(user.id, profile),
        dashboardService.getUserActivities(user.id, 10)
      ]);

      setDynamicStats(stats);
      setDynamicActivities(activities);

      // Load career recommendations
      await loadCareerRecommendations(profile);

      // Generate additional activities if none exist
      if (activities.length === 0) {
        const generatedActivities = await dashboardService.generateDynamicActivities(user.id, profile);
        setDynamicActivities(generatedActivities);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivities(false);
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

  // Generate dynamic activities based on user data
  const generateDynamicActivities = (profileData: any) => {
    const activities = [];
    const now = new Date();

    // Add profile-based activities
    if (profileData.cbe_subjects && profileData.cbe_subjects.length > 0) {
      activities.push({
        id: 1,
        type: 'profile',
        title: 'CBE Subjects Updated',
        description: `Added ${profileData.cbe_subjects.length} subjects to your profile`,
        time: '2 hours ago',
        icon: BookMarked,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        progress: 100
      });
    }

    if (profileData.career_interests && profileData.career_interests.length > 0) {
      activities.push({
        id: 2,
        type: 'interests',
        title: 'Career Interests Defined',
        description: `Explored ${profileData.career_interests.length} career areas`,
        time: '1 day ago',
        icon: Target,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        progress: 90
      });
    }

    // Add AI-generated activities
    activities.push({
      id: 3,
      type: 'ai',
      title: 'AI Career Analysis',
      description: 'Received personalized career recommendations',
      time: '3 days ago',
      icon: Bot,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      progress: 95
    });

    // Add assessment activity
    activities.push({
      id: 4,
      type: 'assessment',
      title: 'Profile Assessment',
      description: `Completed ${calculateProfileCompleteness(profileData)}% of your career profile`,
      time: '1 week ago',
      icon: Trophy,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      progress: calculateProfileCompleteness(profileData)
    });

    setDynamicActivities(activities);
  };

  // Helper functions for career data enhancement
  const getCareerDescription = (careerName: string) => {
    const descriptions: { [key: string]: string } = {
      'Software Engineer': "High demand in Kenya's tech sector with excellent growth prospects.",
      'Data Scientist': "Growing field with opportunities in fintech and healthcare analytics.",
      'Business Analyst': "Strategic role bridging technology and business needs.",
      'Marketing Manager': "Creative field with opportunities in digital marketing and brand management.",
      'Financial Advisor': "Growing demand in Kenya's expanding financial services sector.",
      'Graphic Designer': "Creative opportunities in advertising, media, and digital design.",
      'Engineering Technician': "Hands-on technical role supporting Kenya's infrastructure development.",
      'Content Creator': "Emerging field with opportunities in social media and digital content.",
      'Art Teacher': "Educational role combining creativity with teaching and mentorship."
    };
    return descriptions[careerName] || "Exciting career opportunity aligned with your interests and skills.";
  };

  const getCareerSalary = (careerName: string) => {
    const salaries: { [key: string]: string } = {
      'Software Engineer': 'KES 80K - 200K',
      'Data Scientist': 'KES 70K - 180K',
      'Business Analyst': 'KES 60K - 150K',
      'Marketing Manager': 'KES 50K - 120K',
      'Financial Advisor': 'KES 45K - 100K',
      'Graphic Designer': 'KES 35K - 80K',
      'Engineering Technician': 'KES 40K - 90K',
      'Content Creator': 'KES 30K - 100K',
      'Art Teacher': 'KES 35K - 70K'
    };
    return salaries[careerName] || 'KES 40K - 100K';
  };

  const getCareerGrowth = (careerName: string) => {
    const growth: { [key: string]: string } = {
      'Software Engineer': 'Very High Growth',
      'Data Scientist': 'Very High Growth',
      'Business Analyst': 'High Growth',
      'Marketing Manager': 'High Growth',
      'Financial Advisor': 'Moderate Growth',
      'Graphic Designer': 'Moderate Growth',
      'Engineering Technician': 'High Growth',
      'Content Creator': 'Very High Growth',
      'Art Teacher': 'Stable Growth'
    };
    return growth[careerName] || 'Moderate Growth';
  };

  const getCareerEducation = (careerName: string) => {
    const education: { [key: string]: string } = {
      'Software Engineer': "Bachelor's in Computer Science",
      'Data Scientist': "Bachelor's + Data Analytics Certification",
      'Business Analyst': "Bachelor's in Business/IT",
      'Marketing Manager': "Bachelor's in Marketing/Communications",
      'Financial Advisor': "Bachelor's in Finance/Economics",
      'Graphic Designer': "Diploma/Bachelor's in Design",
      'Engineering Technician': "Diploma in Engineering",
      'Content Creator': "Diploma in Media/Communications",
      'Art Teacher': "Bachelor's in Education (Arts)"
    };
    return education[careerName] || "Bachelor's Degree";
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

    console.log('🤖 loadCareerRecommendations started with profile:', {
      school_level: profileData.school_level,
      current_grade: profileData.current_grade,
      subjects: profileData.cbe_subjects || profileData.subjects,
      interests: profileData.career_interests || profileData.interests
    });

    setIsLoadingRecommendations(true);

    try {
      // Always generate fresh recommendations based on current data
      console.log('🔄 Generating fresh career recommendations based on current profile and grades data');

      // If no existing recommendations, generate new ones with AI including grades data
      console.log('🤖 Generating new career recommendations with AI (including grades data)');

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
        assessmentResults: profileData.assessment_scores,
        academicPerformance: {
          overallAverage: academicPerformance.overallAverage,
          strongSubjects: academicPerformance.strongSubjects,
          weakSubjects: academicPerformance.weakSubjects,
          performanceTrend: academicPerformance.performanceTrend
        }
      }

      // Generate AI recommendations without timeout
      const recommendations = await aiCareerService.generateCareerRecommendations(userContext) as any[];

      if (recommendations && recommendations.length > 0) {
        // Save recommendations to database
        const recommendationsToSave = recommendations.slice(0, 5).map((rec, index) => ({
          career_name: rec.title,
          match_percentage: rec.matchPercentage,
          description: getCareerDescription(rec.title),
          salary_range: getCareerSalary(rec.title),
          growth_prospect: getCareerGrowth(rec.title),
          education_required: getCareerEducation(rec.title),
          skills_required: rec.skills || []
        }));

        await dashboardService.saveCareerRecommendations(user.id, recommendationsToSave);

        // Update chart data
        const top3 = recommendations.slice(0, 3).map((rec, index) => ({
          name: rec.title,
          value: rec.matchPercentage,
          color: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b',
          description: getCareerDescription(rec.title),
          salaryRange: getCareerSalary(rec.title),
          growth: getCareerGrowth(rec.title),
          education: getCareerEducation(rec.title)
        }));

        setCareerData(top3);

        // Track the AI recommendation generation
        trackButtonClick('AI Career Recommendations Generated', 'Dashboard');
      } else {
        // Fallback to enhanced default data if no recommendations
        setCareerData([
          {
            name: 'Software Engineer',
            value: 85,
            color: '#3b82f6',
            description: "High demand in Kenya's tech sector with excellent growth prospects.",
            salaryRange: 'KES 80K - 200K',
            growth: 'High Growth',
            education: "Bachelor's Required"
          },
          {
            name: 'Data Scientist',
            value: 78,
            color: '#10b981',
            description: "Growing field with opportunities in fintech and healthcare analytics.",
            salaryRange: 'KES 70K - 180K',
            growth: 'Very High Growth',
            education: "Bachelor's + Certification"
          },
          {
            name: 'Business Analyst',
            value: 72,
            color: '#f59e0b',
            description: "Strategic role bridging technology and business needs.",
            salaryRange: 'KES 60K - 150K',
            growth: 'Moderate Growth',
            education: "Bachelor's Required"
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load career recommendations:', error);

      // Fallback to sample data on error
      setCareerData([
        { name: 'Complete Assessment', value: 100, color: '#6b7280' },
        { name: 'Explore Careers', value: 0, color: '#e5e7eb' },
        { name: 'Get AI Guidance', value: 0, color: '#e5e7eb' }
      ]);
    } finally {
      setIsLoadingRecommendations(false)
    }
  }



  const handleSignOut = async () => {
    await signOut()
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
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                CareerPath AI
              </h1>
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
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
                <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-foreground-muted text-lg">
                Continue your career discovery journey and unlock your potential.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-foreground-muted">Current Streak</p>
                <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
                  <Zap className="w-5 h-5" />
                  7 days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="careers">Top Careers</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <p className={`text-xs flex items-center gap-1 mt-1 ${
                              stat.stat_trend === 'up' ? 'text-green-600' : 
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Career Recommendations Chart */}
              <Card className="lg:col-span-2 bg-card border-card-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Your Top Career Matches
                      </CardTitle>
                      <CardDescription>Based on your CBE pathway and interests</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
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

              {/* Recent Activity */}
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingActivities ? (
                    // Loading skeleton for activities
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg">
                        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-muted rounded animate-pulse mb-2 w-3/4"></div>
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                            <div className="h-3 bg-muted rounded animate-pulse w-1/6"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    dynamicActivities.slice(0, 3).map((activity) => {
                      const activityConfig = {
                        'profile': { icon: User, color: 'text-blue-500', bgColor: 'bg-blue-50' },
                        'interests': { icon: Target, color: 'text-green-500', bgColor: 'bg-green-50' },
                        'ai': { icon: Bot, color: 'text-purple-500', bgColor: 'bg-purple-50' },
                        'assessment': { icon: Trophy, color: 'text-orange-500', bgColor: 'bg-orange-50' },
                        'career': { icon: Briefcase, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
                        'learning': { icon: BookOpen, color: 'text-emerald-500', bgColor: 'bg-emerald-50' }
                      }[activity.activity_type] || { icon: Activity, color: 'text-gray-500', bgColor: 'bg-gray-50' };

                      const IconComponent = activityConfig.icon;
                      const timeAgo = getTimeAgo(activity.created_at);

                      return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                          <div className={`w-10 h-10 rounded-lg ${activityConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${activityConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{activity.activity_title}</p>
                            <p className="text-xs text-foreground-muted mt-1">{activity.activity_description}</p>
                        <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-foreground-muted">{timeAgo}</p>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${activity.progress_percentage}%` }}
                              />
                            </div>
                                <span className="text-xs font-medium text-foreground-muted">{activity.progress_percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      );
                    })
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => trackButtonClick('View All Activity', 'Recent Activity')}
                  >
                    View All Activity <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <TabsContent value="careers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {career.value}% Match
                            </Badge>
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${career.value}%` }}
                          />
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
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <Target className="w-4 h-4 mr-2" />
                      Get Detailed Insights
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <AIChat />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Free Courses Card */}
              <Card className="bg-card border-card-border">
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
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Your Journey Actions
                  </CardTitle>
                  <CardDescription>Take action to advance your career path</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        setIsGradesModalOpen(true)
                        trackButtonClick('Record Grades', 'Journey Actions')
                      }}
                    >
                      <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Record your academic grades</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
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
                      className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setActiveTab('chat')
                        trackButtonClick('Start Assessment', 'Journey Actions')
                      }}
                    >
                      Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
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
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Academic Performance Section */}
            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  Academic Performance
                </CardTitle>
                <CardDescription>Record and track your academic grades to get better career recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <GradesManager onGradesUpdated={handleGradesUpdated} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Career Detail Modal */}
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
