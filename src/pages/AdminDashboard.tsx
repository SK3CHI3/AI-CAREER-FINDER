import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  Users, BookOpen, Target, TrendingUp, LogOut, Bot,
  Search, Filter, Download, Eye, Shield, Activity,
  Building2, GraduationCap, RefreshCw, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      // ── Counts ──────────────────────────────────────────────────────────
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

      // ── Monthly growth (last 6 months via created_at buckets) ───────────
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

      // ── Career distribution ──────────────────────────────────────────────
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

      // ── Recent users ─────────────────────────────────────────────────────
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

      // ── Subscription Breakdown ──────────────────────────────────────────
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

      // ── Revenue Estimate (Simplified) ───────────────────────────────────
      // In a real app, this would sum actual payments. 
      // Here we'll sum verified student counts for schools on standard/premium tiers
      const totalRevenue = totalAssessments * 5 // Mock revenue logic based on platform value

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
  }, [user])

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const filteredUsers = (stats?.recentUsers ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const metricCards = stats
    ? [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10', note: 'Registered on platform' },
        { label: 'Schools Onboarded', value: stats.totalSchools, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-400/10', note: 'Active institutions' },
        { label: 'Assessments Done', value: stats.totalAssessments, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10', note: 'Career assessments taken' },
        { label: 'Est. Platform Value', value: stats.totalRevenue, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10', note: 'Projected value KES' },
      ]
    : []

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logos/CareerGuide_Logo.png"
                alt="CareerGuide AI"
                className="h-10 w-auto"
              />
              <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs mt-1">Admin Panel</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={loadData}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{getInitials(profile?.full_name ?? 'A')}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden md:block">{profile?.full_name ?? user?.email}</span>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h2>
          <p className="text-foreground-muted text-sm mt-1">Real-time platform metrics and user management.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-background/50 border border-card-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-gradient-surface border-card-border">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded animate-pulse mb-3 w-2/3" />
                        <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </CardContent>
                    </Card>
                  ))
                : metricCards.map(({ label, value, icon: Icon, color, bg, note }) => (
                    <Card key={label} className="bg-gradient-surface border-card-border overflow-hidden relative group">
                      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${bg} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />
                      <CardContent className="p-6 relative">
                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 border border-white/5`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className={`text-3xl font-black ${color} tabular-nums tracking-tight`}>{value.toLocaleString()}</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{label}</p>
                        <p className="text-[10px] text-foreground-muted uppercase tracking-wider mt-0.5">{note}</p>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-surface border-card-border overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base">Subscription Tiers</CardTitle>
                  <CardDescription>Breakdown of institution adoption</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.subscriptionBreakdown ?? []}
                          cx="50%" cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats?.subscriptionBreakdown.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 w-full max-w-[200px]">
                    {stats?.subscriptionBreakdown.map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-foreground-muted">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="text-base">Student Growth — Last 6 Months</CardTitle>
                  <CardDescription>New registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.studentGrowth ?? []} barSize={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        <Bar dataKey="students" fill="#6366f1" name="Students" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="schools" fill="#10b981" name="Schools" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Users ── */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>All registered platform users</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-56"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-10">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary/40" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{u.name}</p>
                                <p className="text-xs text-foreground-muted">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px] uppercase">{u.role}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-foreground-muted">{u.joined}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analytics ── */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="text-base">Platform Summary</CardTitle>
                  <CardDescription>Live counts from Supabase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Total Registered Users', value: ((stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0) + (stats?.totalSchools ?? 0)).toLocaleString() },
                    { label: 'Schools Active', value: stats?.totalSchools.toLocaleString() ?? '—' },
                    { label: 'Career Assessments Completed', value: stats?.totalAssessments.toLocaleString() ?? '—' },
                    { label: 'Unique Career Interests Tracked', value: stats?.careerDistribution.length.toString() ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-foreground-muted">{label}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle className="text-base">Top Career Interests</CardTitle>
                  <CardDescription>Across all students platform-wide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(stats?.careerDistribution ?? []).map((c) => (
                      <Badge
                        key={c.name}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${c.color}22`, color: c.color, borderColor: `${c.color}44` }}
                      >
                        {c.name} ({c.value})
                      </Badge>
                    ))}
                    {(stats?.careerDistribution ?? []).length === 0 && (
                      <p className="text-sm text-foreground-muted">No data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Feedbacks ── */}
          <TabsContent value="feedbacks" className="space-y-6">
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
                <CardDescription>Reports, feature requests, and support queries.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User / Category</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-foreground-muted italic">
                          No feedback reports found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      feedbacks.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-sm flex items-center gap-1.5">
                                {f.category === 'Bug' && <Bug className="w-3.5 h-3.5 text-destructive" />}
                                {f.category === 'Feature' && <Lightbulb className="w-3.5 h-3.5 text-amber-400" />}
                                {f.category === 'Support' && <HelpCircle className="w-3.5 h-3.5 text-primary" />}
                                {f.category === 'General' && <MessageCircle className="w-3.5 h-3.5 text-sky-400" />}
                                {f.category}
                              </p>
                              <p className="text-[10px] text-foreground-muted font-mono">{f.user_email || 'Anonymous Guest'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm leading-relaxed">{f.content}</p>
                          </TableCell>
                          <TableCell className="text-xs text-foreground-muted">
                            {new Date(f.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={f.status === 'resolved' ? 'default' : f.status === 'in-progress' ? 'secondary' : 'outline'}
                              className={`text-[10px] uppercase ${
                                f.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                f.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''
                              }`}
                            >
                              {f.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {f.status !== 'resolved' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[10px] font-bold h-8 text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => updateFeedbackStatus(f.id, f.status === 'new' ? 'in-progress' : 'resolved')}
                                  disabled={!!updatingId}
                                >
                                  {updatingId === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : f.status === 'new' ? 'Start' : 'Resolve'}
                                </Button>
                              )}
                              {f.status === 'resolved' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminDashboard
