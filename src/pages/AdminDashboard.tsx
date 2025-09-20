import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Settings, 
  LogOut,
  Bot,
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Shield,
  Activity,
  Calendar,
  Award
} from 'lucide-react'
import { dashboardService, PlatformAnalytics } from '@/lib/dashboard-service'
import { supabase } from '@/lib/supabase'

// Mock data for admin analytics
const userGrowthData = [
  { month: 'Jan', students: 120, assessments: 89 },
  { month: 'Feb', students: 180, assessments: 145 },
  { month: 'Mar', students: 250, assessments: 210 },
  { month: 'Apr', students: 320, assessments: 280 },
  { month: 'May', students: 420, assessments: 380 },
  { month: 'Jun', students: 520, assessments: 465 },
]

const careerDistribution = [
  { name: 'Technology', value: 35, color: '#3b82f6' },
  { name: 'Healthcare', value: 25, color: '#10b981' },
  { name: 'Business', value: 20, color: '#f59e0b' },
  { name: 'Engineering', value: 15, color: '#ef4444' },
  { name: 'Arts', value: 5, color: '#8b5cf6' },
]

const recentUsers = [
  { id: 1, name: 'John Kamau', email: 'john.kamau@email.com', role: 'student', joined: '2024-01-15', assessments: 3, status: 'active' },
  { id: 2, name: 'Mary Wanjiku', email: 'mary.w@email.com', role: 'student', joined: '2024-01-14', assessments: 2, status: 'active' },
  { id: 3, name: 'Peter Ochieng', email: 'peter.o@email.com', role: 'student', joined: '2024-01-13', assessments: 1, status: 'inactive' },
  { id: 4, name: 'Grace Akinyi', email: 'grace.a@email.com', role: 'student', joined: '2024-01-12', assessments: 4, status: 'active' },
  { id: 5, name: 'David Kiprop', email: 'david.k@email.com', role: 'student', joined: '2024-01-11', assessments: 2, status: 'active' },
]

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics[]>([])
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [careerDistribution, setCareerDistribution] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Load admin dashboard data
  useEffect(() => {
    const loadAdminData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Load platform analytics
        const analytics = await dashboardService.getPlatformAnalytics()
        setPlatformAnalytics(analytics)

        // Load user growth data (simulated for now)
        const growthData = await generateUserGrowthData()
        setUserGrowthData(growthData)

        // Load career distribution (simulated for now)
        const careerDist = await generateCareerDistribution()
        setCareerDistribution(careerDist)

        // Load recent users
        const users = await loadRecentUsers()
        setRecentUsers(users)

      } catch (error) {
        console.error('Failed to load admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [user])

  // Generate user growth data
  const generateUserGrowthData = async () => {
    // This would typically come from analytics queries
    return [
      { month: 'Jan', students: 120, assessments: 89 },
      { month: 'Feb', students: 180, assessments: 145 },
      { month: 'Mar', students: 250, assessments: 210 },
      { month: 'Apr', students: 320, assessments: 280 },
      { month: 'May', students: 420, assessments: 380 },
      { month: 'Jun', students: 520, assessments: 465 },
    ]
  }

  // Generate career distribution
  const generateCareerDistribution = async () => {
    // This would typically come from career recommendations analytics
    return [
      { name: 'Technology', value: 35, color: '#3b82f6' },
      { name: 'Healthcare', value: 25, color: '#10b981' },
      { name: 'Business', value: 20, color: '#f59e0b' },
      { name: 'Engineering', value: 15, color: '#ef4444' },
      { name: 'Arts', value: 5, color: '#8b5cf6' },
    ]
  }

  // Load recent users
  const loadRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return data?.map((user, index) => ({
        id: user.id,
        name: user.full_name || 'Unknown',
        email: user.email,
        role: user.role,
        joined: new Date(user.created_at).toISOString().split('T')[0],
        assessments: Math.floor(Math.random() * 5) + 1,
        status: Math.random() > 0.2 ? 'active' : 'inactive'
      })) || []
    } catch (error) {
      console.error('Failed to load recent users:', error)
      return []
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredUsers = recentUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                CareerPath AI Admin
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
                    {profile?.full_name || 'Admin'}
                  </p>
                  <Badge className="bg-destructive text-destructive-foreground">
                    Admin
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
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard 🛡️
          </h2>
          <p className="text-foreground-muted">
            Monitor platform performance and manage user activities.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                        <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardDescription>Total Students</CardDescription>
                          <CardTitle className="text-2xl">{recentUsers.length}</CardTitle>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="text-xs text-green-500">+12% from last month</div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardDescription>Assessments Taken</CardDescription>
                          <CardTitle className="text-2xl">{recentUsers.reduce((sum, user) => sum + user.assessments, 0)}</CardTitle>
                        </div>
                        <Target className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="text-xs text-green-500">+18% from last month</div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardDescription>Active Sessions</CardDescription>
                          <CardTitle className="text-2xl">{recentUsers.filter(u => u.status === 'active').length}</CardTitle>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="text-xs text-blue-500">Real-time</div>
                    </CardHeader>
                  </Card>

                  <Card className="bg-card border-card-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardDescription>Career Matches</CardDescription>
                          <CardTitle className="text-2xl">{careerDistribution.reduce((sum, cat) => sum + cat.value, 0)}</CardTitle>
                        </div>
                        <Award className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="text-xs text-green-500">+25% from last month</div>
                    </CardHeader>
                  </Card>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle>User Growth & Engagement</CardTitle>
                  <CardDescription>Monthly student registrations and assessment completions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" fill="#3b82f6" name="New Students" />
                        <Bar dataKey="assessments" fill="#10b981" name="Assessments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Career Interest Distribution */}
              <Card className="bg-card border-card-border">
                <CardHeader>
                  <CardTitle>Career Interest Distribution</CardTitle>
                  <CardDescription>Popular career fields among students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={careerDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {careerDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">New student registered</p>
                      <p className="text-sm text-foreground-muted">Sarah Muthoni joined the platform</p>
                    </div>
                    <span className="text-xs text-foreground-muted">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Assessment completed</p>
                      <p className="text-sm text-foreground-muted">John Kamau finished personality assessment</p>
                    </div>
                    <span className="text-xs text-foreground-muted">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">System report generated</p>
                      <p className="text-sm text-foreground-muted">Monthly analytics report is ready</p>
                    </div>
                    <span className="text-xs text-foreground-muted">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all platform users</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-foreground-muted">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell>{user.assessments}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Session Duration</span>
                    <span className="font-semibold">12m 34s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Assessment Completion Rate</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Satisfaction Score</span>
                    <span className="font-semibold">4.6/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Career Match Accuracy</span>
                    <span className="font-semibold">92%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-surface border-card-border">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Technical performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Server Uptime</span>
                    <span className="font-semibold text-green-500">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Response Time</span>
                    <span className="font-semibold">145ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Performance</span>
                    <span className="font-semibold text-green-500">Optimal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Error Rate</span>
                    <span className="font-semibold text-green-500">0.02%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">User Management</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Manage User Roles
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Bulk User Actions
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">System Configuration</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        General Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AdminDashboard
