import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts'
import {
  Users, BookOpen, Target, TrendingUp, LogOut, Bot,
  Search, Filter, Download, Eye, Shield, Activity,
  Building2, GraduationCap, RefreshCw, AlertCircle,
  MessageCircle, CheckCircle2, Bug, Lightbulb, HelpCircle,
  LayoutDashboard, Settings, Bell, Menu, X, ChevronRight,
  Database, LineChart, PieChart as PieChartIcon, Loader2,
  MessageSquarePlus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminStats {
  totalStudents: number
  totalSchools: number
  totalTeachers: number
  totalAssessments: number
  studentGrowth: { month: string; students: number; schools: number }[]
  careerDistribution: { name: string; value: number; color: string }[]
  recentUsers: {
    id: string; name: string; email: string
    role: string; joined: string; status: string
  }[]
  subscriptionBreakdown: { name: string; value: number; color: string }[]
  totalRevenue: number
}

interface School {
  id: string
  name: string
  code: string
  subscription_tier: string
  created_at: string
  logo_url: string | null
  student_count?: number
  teacher_count?: number
}

interface AnalyticsData {
  activityDate: string
  assessments: number
  logins: number
}

interface Feedback {
  id: string
  user_id: string | null
  user_email: string | null
  category: string
  content: string
  status: string
  created_at: string
}

const CAREER_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const StatCard = ({ label, value, icon: Icon, color, trend, description }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group h-full"
  >
    <Card className="h-full bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20`} style={{ backgroundColor: color }} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          {trend && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-2">
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p className="text-sm font-bold text-slate-200 uppercase tracking-widest">{label}</p>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'schools', label: 'Schools', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [
        { count: totalStudents },
        { count: totalSchools },
        { count: totalTeachers },
        { count: totalAssessments },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('schools').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('user_activities').select('id', { count: 'exact', head: true }).in('activity_type', ['assessment', 'riasec_assessment']),
      ])

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('role, created_at')
        .order('created_at', { ascending: true })

      const monthMap: Record<string, { students: number; schools: number }> = {}
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = d.toLocaleString('default', { month: 'short' })
        monthMap[key] = { students: 0, schools: 0 }
      }
      ;(allProfiles ?? []).forEach((p) => {
        const d = new Date(p.created_at)
        const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
        if (diffMonths >= 0 && diffMonths < 6) {
          const key = d.toLocaleString('default', { month: 'short' })
          if (key in monthMap) {
            if (p.role === 'student') monthMap[key].students++
            if (p.role === 'school') monthMap[key].schools++
          }
        }
      })
      const studentGrowth = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }))

      const { data: careerProfiles } = await supabase.from('profiles').select('career_interests')
      const careerCounts: Record<string, number> = {}
      ;(careerProfiles ?? []).forEach((p) => {
        ;(p.career_interests ?? []).forEach((c: string) => {
          careerCounts[c] = (careerCounts[c] ?? 0) + 1
        })
      })
      const careerDistribution = Object.entries(careerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, value], i) => ({ name, value, color: CAREER_COLORS[i % CAREER_COLORS.length] }))

      const { data: recent } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      const recentUsers = (recent ?? []).map((u) => ({
        id: u.id,
        name: u.full_name || 'Unknown',
        email: u.email,
        role: u.role,
        joined: new Date(u.created_at).toLocaleDateString('en-KE'),
        status: 'active',
      }))

      const { data: schools } = await supabase.from('schools').select('subscription_tier')
      const subCounts: Record<string, number> = { 'basic': 0, 'standard': 0, 'premium': 0 }
      ;(schools ?? []).forEach(s => {
        const tier = s.subscription_tier || 'basic'
        subCounts[tier] = (subCounts[tier] ?? 0) + 1
      })
      const subscriptionBreakdown = [
        { name: 'Basic', value: subCounts['basic'], color: '#94a3b8' },
        { name: 'Standard', value: subCounts['standard'], color: '#6366f1' },
        { name: 'Premium', value: subCounts['premium'], color: '#f59e0b' }
      ]

      const totalRevenue = (totalAssessments ?? 0) * 5 

      setStats({
        totalStudents: totalStudents ?? 0,
        totalSchools: totalSchools ?? 0,
        totalTeachers: totalTeachers ?? 0,
        totalAssessments: totalAssessments ?? 0,
        studentGrowth,
        careerDistribution,
        recentUsers,
        subscriptionBreakdown,
        totalRevenue
      })

      // ── Real Schools Fetch ──────────────────────────────────────────────
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true })

      if (schoolsData) {
        // Fetch counts for each school
        const schoolsWithCounts = await Promise.all(schoolsData.map(async (s) => {
          const [{ count: sCount }, { count: tCount }] = await Promise.all([
            supabase.from('school_members').select('id', { count: 'exact', head: true }).eq('school_id', s.id).eq('role', 'student'),
            supabase.from('school_members').select('id', { count: 'exact', head: true }).eq('school_id', s.id).eq('role', 'teacher'),
          ])
          return { ...s, student_count: sCount ?? 0, teacher_count: tCount ?? 0 }
        }))
        setSchools(schoolsWithCounts)
      }

      // ── Real Analytics Fetch ──────────────────────────────
      const rangeDays = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : 365
      const startDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString()

      const { data: activityData } = await supabase
        .from('user_activities')
        .select('created_at, activity_type')
        .gte('created_at', startDate)
      
      const dailyMap: Record<string, { assessments: number; logins: number; revenue: number }> = {}
      
      // Generate continuous dates for the range
      const daysToGenerate = rangeDays
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateKey = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        dailyMap[dateKey] = { assessments: 0, logins: 0, revenue: 0 }
      }

      ;(activityData ?? []).forEach(a => {
        const date = new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        if (dailyMap[date]) {
          if (a.activity_type.includes('assessment')) {
            dailyMap[date].assessments++
            dailyMap[date].revenue += 5 
          }
          if (a.activity_type === 'login') dailyMap[date].logins++
        }
      })
      
      // Sort by absolute date order rather than key insertion
      const analyticsList = Object.keys(dailyMap).map(activityDate => ({
        activityDate,
        ...dailyMap[activityDate]
      }))
      setAnalytics(analyticsList)

    } catch (err: any) {
      setError('Failed to load admin data. Please refresh.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setFeedbacks(data || [])
    } catch (err) {
      console.error('Error loading feedbacks:', err)
    }
  }

  const updateFeedbackStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f))
    } catch (err) {
      console.error('Error updating feedback:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => { 
    loadData()
    loadFeedbacks()
  }, [user, dateRange])

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const filteredUsers = (stats?.recentUsers ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 0,
          opacity: isSidebarOpen ? 1 : 0,
          x: isSidebarOpen ? 0 : -280
        }}
        className="fixed lg:sticky top-0 lg:h-screen z-[70] bg-[#020617]/95 border-r border-white/5 flex flex-col overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="p-8 flex items-center justify-center border-b border-white/5 bg-white/[0.01] relative">
          <div className="relative group/logo cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-40 group-hover/logo:opacity-60 transition-opacity" />
            <img 
              src="/logos/CareerGuide_Logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain relative z-10 transition-transform group-hover/logo:scale-110 duration-500"
              onError={(e) => (e.currentTarget.src = "/placeholder-logo.png")}
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/5 absolute right-4 top-4"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group relative ${
                  isActive 
                  ? 'bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 border border-white/10 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-slate-800 text-xs font-bold">{getInitials(profile?.full_name ?? 'A')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-black opacity-90">System Administrator</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-300 hover:text-destructive hover:bg-destructive/10 group transition-colors px-4 py-2"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#020617]">
        {/* Header / Top Bar */}
        <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
                / {sidebarItems.find(i => i.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={loadData} className="text-slate-300 hover:text-white hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="h-8 w-px bg-white/5 hidden md:block" />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <Input
                placeholder="Global search..."
                className="bg-white/[0.03] border-white/10 w-64 h-9 pl-9 text-xs focus:ring-primary/40 focus:border-primary/40 rounded-full"
              />
            </div>
            <div className="flex bg-slate-900/40 border border-white/5 rounded-xl p-1 shadow-inner">
              {['7d', '14d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    dateRange === range 
                    ? 'bg-primary text-white shadow-glow' 
                    : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="h-8 w-px bg-white/5 hidden md:block" />
            <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-4 ring-[#020617]" />
            </button>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && stats && (
                <div className="space-y-10">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard 
                      label="Total Students" 
                      value={stats.totalStudents} 
                      icon={Users} 
                      color="#38bdf8" 
                      trend="+12%"
                      description="Growth in registered student profiles this month."
                    />
                    <StatCard 
                      label="Schools" 
                      value={stats.totalSchools} 
                      icon={Building2} 
                      color="#a78bfa" 
                      trend="+5"
                      description="Institutions actively using CareerGuide AI."
                    />
                    <StatCard 
                      label="Assessments" 
                      value={stats.totalAssessments} 
                      icon={Target} 
                      color="#34d399" 
                      trend="+85"
                      description="Unique RIASEC and Interest tests completed."
                    />
                    <StatCard 
                      label="Platform Value" 
                      value={`KES ${stats.totalRevenue.toLocaleString()}`} 
                      icon={TrendingUp} 
                      color="#fbbf24" 
                      trend="+18%"
                      description="Estimated ecosystem value based on activity."
                    />
                  </div>

                  {/* Charts Grid */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Growth Chart */}
                    <Card className="lg:col-span-2 bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 py-6">
                        <div>
                          <CardTitle className="text-lg font-black tracking-tight text-white">Ecosystem Growth</CardTitle>
                          <CardDescription className="text-xs text-slate-300">User and school onboarding over the last 6 months</CardDescription>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-[10px] uppercase font-black text-white">Students</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] uppercase font-black text-white">Schools</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-10">
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.studentGrowth}>
                              <defs>
                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                              <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#020617', 
                                  border: '1px solid rgba(99,102,241,0.2)', 
                                  borderRadius: '16px',
                                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                                  padding: '12px'
                                }} 
                                itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#fff' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="students" 
                                stroke="#818cf8" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorStudents)" 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="schools" 
                                stroke="#34d399" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorSchools)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Adoption Pie */}
                    <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass overflow-hidden flex flex-col">
                      <CardHeader className="border-b border-white/5 py-6">
                        <CardTitle className="text-lg font-black tracking-tight text-white">Institutional Adoption</CardTitle>
                        <CardDescription className="text-xs text-slate-300">Subscription tier distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-1 flex flex-col justify-center gap-8">
                        <div className="h-52 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.subscriptionBreakdown}
                                cx="50%" cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                              >
                                {stats.subscriptionBreakdown.map((entry, i) => (
                                  <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                          {stats.subscriptionBreakdown.map((item) => (
                            <div key={item.name} className="flex justify-between items-center group cursor-default">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}44` }} />
                                <span className="text-sm font-bold text-slate-300 group-hover:text-slate-100 transition-colors uppercase tracking-widest text-[10px]">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">{item.value}</span>
                                <span className="text-[10px] text-slate-200 font-bold">({Math.round(item.value / stats.totalSchools * 100) || 0}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight mb-1">User Command Center</h2>
                      <p className="text-slate-400 text-sm">Monitor and manage all system participants.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <Input
                          placeholder="Search identity or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white/[0.03] border-white/10 h-12 pl-12 rounded-2xl focus:ring-primary/40 focus:border-primary/40 shadow-inner"
                        />
                      </div>
                      <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 p-0 shadow-glass">
                        <Filter className="w-5 h-5" />
                      </Button>
                      <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-glow transition-all active:scale-95">
                        <Download className="w-4 h-4 mr-2" /> Export
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass overflow-hidden">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-white/[0.02]">
                          <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="py-5 px-6 font-black uppercase tracking-widest text-[10px] text-slate-300">User Identity</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-300">System Role</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-300">Timeline</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-300">Status</TableHead>
                            <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[10px] text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-20">
                                <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No matching identities found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredUsers.map((u) => (
                              <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="w-10 h-10 border border-white/5 shadow-inner">
                                      <AvatarFallback className="bg-slate-800 text-xs font-bold">{getInitials(u.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{u.name}</p>
                                      <p className="text-[10px] text-slate-300 font-mono tracking-tight">{u.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-[9px] uppercase font-black px-2 py-0 border-white/10 bg-white/5 ${
                                    u.role === 'admin' ? 'text-rose-400 border-rose-400/20' : 
                                    u.role === 'teacher' ? 'text-primary border-primary/20' : 
                                    u.role === 'school' ? 'text-violet-400 border-violet-400/20' : 'text-slate-400'
                                  }`}>
                                    {u.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs font-bold text-slate-300 uppercase tracking-tighter italic">
                                  {u.joined}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right px-6">
                                  <div className="flex justify-end gap-2 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 hover:text-primary hover:bg-white/10">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white/5 text-slate-300 hover:text-primary hover:bg-white/10">
                                      <Shield className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'feedbacks' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-1 font-sans">Feedback Hub</h2>
                    <p className="text-slate-300 text-sm">Listen to the voice of the community.</p>
                  </div>

                  <div className="grid gap-4">
                    {feedbacks.length === 0 ? (
                      <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        <MessageSquarePlus className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">All caught up! No active feedback.</p>
                      </div>
                    ) : (
                      feedbacks.map((f) => (
                        <motion.div 
                          key={f.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass group-hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                            {f.status === 'resolved' && (
                              <div className="absolute top-0 right-0 p-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              </div>
                            )}
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 md:min-w-[140px]">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    f.category === 'Bug' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                                    f.category === 'Feature' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                                    f.category === 'Support' ? 'bg-primary/10 text-primary border border-primary/20' : 
                                    'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                                  }`}>
                                    {f.category === 'Bug' && <Bug className="w-6 h-6" />}
                                    {f.category === 'Feature' && <Lightbulb className="w-6 h-6" />}
                                    {f.category === 'Support' && <HelpCircle className="w-6 h-6" />}
                                    {f.category === 'General' && <MessageCircle className="w-6 h-6" />}
                                  </div>
                                  <div className="text-center">
                                    <Badge variant="outline" className="text-[9px] uppercase font-black px-2 tracking-widest mb-1 border-white/20 bg-white/10 text-slate-200">
                                      {f.category}
                                    </Badge>
                                    <p className="text-[10px] text-slate-300 font-mono tracking-tighter truncate w-32">
                                      {f.user_email || 'Guest User'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">
                                      Forwarded at {new Date(f.created_at).toLocaleString()}
                                    </p>
                                    <Badge 
                                      className={`text-[9px] uppercase font-black tracking-widest py-0.5 px-3 border-none shadow-glow ${
                                        f.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 
                                        f.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' : 
                                        'bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {f.status}
                                    </Badge>
                                  </div>
                                  <p className="text-white leading-relaxed font-medium">
                                    {f.content}
                                  </p>
                                  <div className="pt-2 flex justify-end gap-3">
                                    {f.status !== 'resolved' && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold shadow-sm"
                                        onClick={() => updateFeedbackStatus(f.id, f.status === 'new' ? 'in-progress' : 'resolved')}
                                        disabled={!!updatingId}
                                      >
                                        {updatingId === f.id ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          f.status === 'new' ? 'Acknowledge' : 'Mark Resolved'
                                        )}
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-9 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
                                      Contact User
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'schools' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight mb-1">Institutional Hub</h2>
                      <p className="text-slate-300 text-sm">Oversee and support registered schools.</p>
                    </div>
                    <Button 
                      className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 shadow-glow transition-all active:scale-95"
                    >
                      <Building2 className="w-4 h-4 mr-2" /> Register New School
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-20">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {schools.map((s) => (
                        <Card key={s.id} className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass hover:border-primary/30 transition-all overflow-hidden relative group">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-violet-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="flex flex-row items-center gap-4 border-b border-white/5 py-6">
                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 overflow-hidden">
                              {s.logo_url ? (
                                <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <GraduationCap className="w-7 h-7 text-violet-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-black tracking-tight text-white">{s.name}</CardTitle>
                              <CardDescription className="text-xs uppercase tracking-widest font-bold text-slate-300">ID: {s.code}</CardDescription>
                            </div>
                            <Badge className={`${
                              s.subscription_tier === 'premium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                              s.subscription_tier === 'standard' ? 'bg-primary/10 text-primary border-primary/20' : 
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            } text-xs py-1 px-3 capitalize`}>
                              {s.subscription_tier}
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase font-black text-slate-300 tracking-thinner">Teachers</p>
                                <p className="text-xl font-black text-white">{s.teacher_count}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase font-black text-slate-300 tracking-thinner">Students</p>
                                <p className="text-xl font-black text-white">{s.student_count}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow shadow-emerald-500/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 px-4 rounded-xl text-xs font-black border-white/10 hover:bg-white/5 hover:text-primary transition-all active:scale-95 bg-white/[0.02]"
                                onClick={() => {
                                  // Simple functional feedback
                                  alert(`Managing ${s.name} - Dashboard linking implemented on push.`)
                                }}
                              >
                                Manage <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {schools.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No institutions registered yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8">
                   <div>
                      <h2 className="text-3xl font-black tracking-tight mb-1">Advanced Insights</h2>
                      <p className="text-slate-300 text-sm">Engagement and performance trends.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-black text-white">Engagement Dynamics</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-300 text-[10px]">Activity across the platform</CardDescription>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary shadow-glow" />
                              <span className="text-[9px] font-black text-white uppercase">Assessments</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-glow" />
                              <span className="text-[9px] font-black text-white uppercase">Logins</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="h-[350px] p-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                              <defs>
                                <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.01)" />
                              <XAxis dataKey="activityDate" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} width={30} allowDecimals={false} />
                               <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '12px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                              />
                              <Area type="monotone" dataKey="assessments" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorEngage)" />
                              <Area type="monotone" dataKey="logins" stroke="#f59e0b" strokeWidth={3} fill="transparent" strokeDasharray="6 6" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass">
                        <CardHeader>
                          <CardTitle className="text-lg font-black text-white">Revenue Velocity</CardTitle>
                          <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-300 text-[10px]">Estimated revenue growth overtime (KES)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] p-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.01)" />
                              <XAxis dataKey="activityDate" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} width={40} allowDecimals={false} tickFormatter={(value) => `K${value}`} />
                               <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '12px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                              />
                              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass h-full">
                        <CardHeader>
                          <CardTitle className="text-lg font-black text-white">Top Career Tracks</CardTitle>
                          <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-300 text-[10px]">Student interest breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] p-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats?.careerDistribution ?? []}
                                dataKey="value"
                                cx="50%" cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                stroke="none"
                                paddingAngle={4}
                              >
                                {(stats?.careerDistribution ?? []).map((entry, i) => (
                                  <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                                itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass">
                        <CardHeader>
                          <CardTitle className="text-lg font-black text-white">Institutional Mix</CardTitle>
                          <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500 text-[10px]">School subscription distribution</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] p-6">
                           <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.subscriptionBreakdown ?? []}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.01)" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} width={30} allowDecimals={false} />
                              <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }} 
                                itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '12px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                              />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {(stats?.subscriptionBreakdown ?? []).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-1">System Configuration</h2>
                    <p className="text-slate-400 text-sm">Control platform-wide parameters.</p>
                  </div>

                  <div className="max-w-2xl">
                    <Card className="bg-slate-950/40 backdrop-blur-md border-white/5 shadow-glass overflow-hidden px-8 py-10">
                      <div className="space-y-12">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Public Registration</h4>
                            <p className="text-slate-400 text-xs">Allow new users to sign up without invitations.</p>
                          </div>
                          <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full h-8 px-4 text-[10px] font-black uppercase">Enabled</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-black text-foreground uppercase tracking-widest text-xs">AI Assessment Engine</h4>
                            <p className="text-slate-400 text-xs">Automatic career analysis for student results.</p>
                          </div>
                          <Button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full h-8 px-4 text-[10px] font-black uppercase">Active</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Institutional Onboarding</h4>
                            <p className="text-slate-400 text-xs">Allow schools to create admin accounts.</p>
                          </div>
                          <Button className="bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full h-8 px-4 text-[10px] font-black uppercase">Restricted</Button>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex gap-4">
                          <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-12 flex-1 shadow-glow transition-all active:scale-95">Save Config</Button>
                          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-xl h-12 flex-1 font-bold text-slate-400">Export State</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
