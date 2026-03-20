import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService, type School, type TeacherProfile, type TeacherInvite } from '@/lib/school-service'
import { classService, type ClassRecord } from '@/lib/class-service'
import SchoolOnboarding from '@/components/school/SchoolOnboarding'
import InviteTeacher from '@/components/school/InviteTeacher'
import SubscriptionCard from '@/components/school/SubscriptionCard'
import SchoolInsights from '@/components/school/SchoolInsights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bot, Building2, LogOut, Users, BookOpen, GraduationCap,
  Plus, ChevronRight, Clock, Mail, Trash2, RefreshCw, CreditCard, Sparkles
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const SchoolDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, signOut, refreshProfile } = useAuth()

  const [school, setSchool] = useState<School | null>(null)
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [pendingInvites, setPendingInvites] = useState<TeacherInvite[]>([])
  const [stats, setStats] = useState({ teacherCount: 0, classCount: 0, studentCount: 0 })
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const mySchool = await schoolService.getMySchool(user.id)
      if (!mySchool) { setNeedsOnboarding(true); setLoading(false); return }

      setSchool(mySchool)
      setNeedsOnboarding(false)

      const [teacherList, classList, invites, schoolStats] = await Promise.allSettled([
        schoolService.getSchoolTeachers(mySchool.id),
        classService.getSchoolClasses(mySchool.id),
        schoolService.getPendingInvites(mySchool.id),
        schoolService.getSchoolStats(mySchool.id),
      ])

      if (teacherList.status === 'fulfilled') setTeachers(teacherList.value)
      if (classList.status === 'fulfilled') setClasses(classList.value)
      if (invites.status === 'fulfilled') setPendingInvites(invites.value)
      if (schoolStats.status === 'fulfilled') setStats(schoolStats.value)
    } catch (err) {
      console.error('School dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const initials = (name: string | null) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (needsOnboarding) {
    return <SchoolOnboarding onComplete={() => { refreshProfile(); loadData() }} />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logos/CareerGuide_Logo.png"
                alt="CareerGuide AI"
                className="h-10 w-auto"
              />
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mt-1">School Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">{school?.name ?? 'School'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={loadData} title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{initials(profile?.full_name ?? null)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden md:block">{profile?.full_name ?? user?.email}</span>
              <Badge variant="secondary">School Admin</Badge>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Page Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">School Management</h1>
            <p className="text-foreground-muted text-sm mt-1 max-w-md">
              Institutional oversight for <span className="text-primary font-medium">{school?.name}</span>.
              {school?.code && <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono text-[10px] tracking-widest">{school.code}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {school && user && (
              <InviteTeacher
                schoolId={school.id}
                invitedBy={user.id}
                onInvited={loadData}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => navigate('/school/insights')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </Button>
            <Button variant="outline" size="sm" onClick={loadData} className="h-9">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Academic Staff', value: stats.teacherCount, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Classes', value: stats.classCount, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Enrolled Students', value: stats.studentCount, icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-gradient-surface border-card-border overflow-hidden relative group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${bg} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />
              <CardContent className="p-6 flex items-center gap-5 relative">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-sm border border-white/5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground tabular-nums tracking-tight">{loading ? '—' : value}</p>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Side-by-Side Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teachers Section */}
          <Card className="bg-gradient-surface border-card-border flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Teachers
                </CardTitle>
                <CardDescription>Academic staff roster</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => navigate('/school/teachers')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-primary/30" /></div>
              ) : teachers.length === 0 && pendingInvites.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No teachers registered yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.slice(0, 3).map((t) => (
                    <div key={t.user_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-card-border/50 group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-card-border/50 shadow-sm">
                          <AvatarFallback className="bg-background text-[10px]">{initials(t.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t.full_name ?? t.email}</p>
                          <p className="text-[10px] text-foreground-muted">{t.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[9px] px-1.5 h-4 uppercase">{t.school_role === 'school_admin' ? 'Admin' : 'Staff'}</Badge>
                    </div>
                  ))}

                  {pendingInvites.length > 0 && teachers.length < 3 && pendingInvites.slice(0, 3 - teachers.length).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-dashed border-card-border/50 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center border border-dashed border-card-border">
                          <Mail className="w-4 h-4 text-foreground-muted" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{inv.email}</p>
                          <p className="text-[9px] text-foreground-muted">Invite pending...</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 h-4">Sent</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classes Section */}
          <Card className="bg-gradient-surface border-card-border flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Classes
                </CardTitle>
                <CardDescription>Academic stream overview</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => navigate('/school/classes')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-primary/30" /></div>
              ) : classes.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <BookOpen className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No classes created yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.slice(0, 3).map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 rounded-xl bg-muted/20 border border-card-border/50 hover:border-primary/20 transition-all cursor-pointer group"
                      onClick={() => navigate(`/teacher/class/${cls.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{cls.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] h-3 px-1 border-primary/20 text-primary uppercase">{cls.grade_level}</Badge>
                            <span className="text-[10px] text-foreground-muted">{cls.academic_year}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* School Insights Section */}
        {school && (
          <SchoolInsights schoolId={school.id} />
        )}

        {/* Subscription / Billing Section */}
        <SubscriptionCard
          currentTier={school?.subscription_tier ?? 'FREE'}
          studentCount={stats.studentCount}
          onUpdate={loadData}
        />
      </main>
    </div>
  )
}

export default SchoolDashboard
