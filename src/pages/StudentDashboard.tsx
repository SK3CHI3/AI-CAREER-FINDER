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
  Lightbulb
} from 'lucide-react'
import AIChat from '@/components/AIChat'
import { ProfileSetup } from '@/components/ProfileSetup'
import { supabase } from '@/lib/supabase'
import { aiCareerService } from '@/lib/ai-service'

// Default career data - will be replaced with AI recommendations
const defaultCareerData = [
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
  const [careerData, setCareerData] = useState(defaultCareerData)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [dynamicStats, setDynamicStats] = useState(quickStats)
  const [dynamicActivities, setDynamicActivities] = useState(recentActivities)

  // Load data when component mounts (user and profile guaranteed by ProtectedRoute)
  useEffect(() => {
    if (user && profile) {
      fetchUserStats();
      fetchAIInsights();
      loadCareerRecommendations(profile);
    }
  }, [user, profile])

  // Generate dynamic stats based on profile data
  const fetchUserStats = () => {
    if (!user || !profile) return;

    // Calculate dynamic stats based on profile data
    const profileCompleteness = calculateProfileCompleteness(profile);
    const careerMatchesCount = Math.max(careerData.length, 3); // Ensure at least 3
    const aiSessionsCount = Math.floor(Math.random() * 30) + 10; // Simulate AI sessions
    const learningHours = Math.floor(Math.random() * 50) + 20; // Simulate learning hours

    setDynamicStats([
      {
        ...quickStats[0],
        value: careerMatchesCount.toString(),
        change: `+${Math.floor(Math.random() * 5) + 1} this week`
      },
      {
        ...quickStats[1],
        value: `${profileCompleteness}%`,
        change: `+${Math.floor(Math.random() * 20) + 5}% this month`
      },
      {
        ...quickStats[2],
        value: aiSessionsCount.toString(),
        change: `+${Math.floor(Math.random() * 10) + 3} this week`
      },
      {
        ...quickStats[3],
        value: `${learningHours}h`,
        change: `+${Math.floor(Math.random() * 15) + 5}h this week`
      }
    ]);

    // Generate dynamic activities based on profile data
    generateDynamicActivities(profile);
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
    console.log('🤖 loadCareerRecommendations started with profile:', {
      school_level: profileData.school_level,
      current_grade: profileData.current_grade,
      subjects: profileData.cbe_subjects || profileData.subjects,
      interests: profileData.career_interests || profileData.interests
    });

    setIsLoadingRecommendations(true);

    // Set a timeout for the AI call
    console.log('⏰ Setting 15-second timeout for AI call');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        console.log('⏰ AI request timeout after 15 seconds');
        reject(new Error('AI request timeout'));
      }, 15000)
    );

    try {
      const userContext = {
        name: profile?.full_name || undefined,
        schoolLevel: profileData.school_level,
        currentGrade: profileData.current_grade || undefined,
        subjects: profileData.cbe_subjects || profileData.subjects || undefined,
        interests: profileData.career_interests || profileData.interests || undefined,
        careerGoals: profileData.career_goals || undefined,
        assessmentResults: profileData.assessment_scores
      }

      // Race between AI call and timeout
      const recommendations = await Promise.race([
        aiCareerService.generateCareerRecommendations(userContext),
        timeoutPromise
      ]) as any[];

      if (recommendations && recommendations.length > 0) {
        const top3 = recommendations.slice(0, 3).map((rec, index) => ({
          name: rec.title,
          value: rec.matchPercentage,
          color: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b'
        }));

        setCareerData(top3);

        // Enhance recommendations with additional data
        const enhancedRecommendations = top3.map((rec, index) => ({
          ...rec,
          description: getCareerDescription(rec.name),
          salaryRange: getCareerSalary(rec.name),
          growth: getCareerGrowth(rec.name),
          education: getCareerEducation(rec.name)
        }));

        setCareerData(enhancedRecommendations);

        // Cache the results
        localStorage.setItem(`career_recommendations_${user?.id}`, JSON.stringify(enhancedRecommendations));
        localStorage.setItem(`career_recommendations_timestamp_${user?.id}`, Date.now().toString());
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
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
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
              {dynamicStats.map((stat) => (
                <Card key={stat.id} className="bg-gradient-surface border-card-border hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
                        <CardTitle className="text-3xl font-bold mt-1">{stat.value}</CardTitle>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Career Recommendations Chart */}
              <Card className="lg:col-span-2 bg-gradient-surface border-card-border">
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
              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dynamicActivities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{activity.title}</p>
                        <p className="text-xs text-foreground-muted mt-1">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-foreground-muted">{activity.time}</p>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${activity.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-foreground-muted">{activity.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View All Activity <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer">
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer">
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
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Explore Paths <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer">
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
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab('chat')}>
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
                <Card key={index} className="bg-gradient-surface border-card-border hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{career.name}</CardTitle>
                          <CardDescription>{career.value}% Match</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${career.value}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground-muted mt-1">{career.value}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground-muted mb-4">
                      {career.description || "Based on your CBE pathway and interests, this career shows strong alignment with your profile."}
                    </p>
                    <div className="flex items-center justify-between text-xs text-foreground-muted mb-4">
                      <span>💰 {career.salaryRange || 'KES 50K - 120K'}</span>
                      <span>📈 {career.growth || 'High Growth'}</span>
                    </div>
                    <div className="text-xs text-foreground-muted mb-4">
                      🎓 {career.education || "Bachelor's Required"}
                    </div>
                    <Button variant="outline" className="w-full">
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
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
              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription>Track your career exploration milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dynamicActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-foreground-muted">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{activity.progress}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Next Steps
                  </CardTitle>
                  <CardDescription>Recommended actions for your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Complete Skills Assessment</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-foreground-muted rounded-full"></div>
                      <span className="text-sm text-foreground-muted">Update academic interests</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-foreground-muted rounded-full"></div>
                      <span className="text-sm text-foreground-muted">Explore university programs</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Take Next Assessment <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default StudentDashboard
