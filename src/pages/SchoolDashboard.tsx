import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService, type School, type TeacherProfile, type TeacherInvite } from '@/lib/school-service'
import { classService, type ClassRecord } from '@/lib/class-service'
import SchoolOnboarding from '@/components/school/SchoolOnboarding'
import InviteTeacher from '@/components/school/InviteTeacher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bot, Building2, LogOut, Users, BookOpen, GraduationCap,
  Plus, ChevronRight, Clock, Mail, Trash2, RefreshCw, CreditCard
} from 'lucide-react'

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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">CareerPath AI</span>
              <span className="text-foreground-muted">·</span>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">{school?.name ?? 'School'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">School Dashboard</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {school?.code && <span className="font-mono mr-2 text-primary">{school.code}</span>}
            {school?.region && <span>{school.region}</span>}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Teachers', value: stats.teacherCount, icon: GraduationCap, color: 'text-blue-400' },
            { label: 'Classes', value: stats.classCount, icon: BookOpen, color: 'text-purple-400' },
            { label: 'Students', value: stats.studentCount, icon: Users, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-gradient-surface border-card-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? '—' : value}</p>
                  <p className="text-sm text-foreground-muted">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teachers section */}
        <Card className="bg-gradient-surface border-card-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Teachers
              </CardTitle>
              <CardDescription>Manage teacher access for your school</CardDescription>
            </div>
            {school && user && (
              <InviteTeacher
                schoolId={school.id}
                invitedBy={user.id}
                onInvited={loadData}
              />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-foreground-muted">Loading...</p>
            ) : teachers.length === 0 && pendingInvites.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-foreground-muted text-sm">No teachers yet. Invite your first teacher above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teachers.map((t) => (
                  <div key={t.user_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-card-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs">{initials(t.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.full_name ?? t.email}</p>
                        <p className="text-xs text-foreground-muted">{t.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{t.school_role}</Badge>
                      <Button
                        variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive"
                        onClick={async () => {
                          if (!school) return
                          if (!window.confirm(`Remove ${t.full_name ?? t.email}?`)) return
                          await schoolService.removeTeacher(school.id, t.user_id)
                          loadData()
                        }}
                        title="Remove teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Pending invites */}
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-dashed border-card-border opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-foreground-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{inv.email}</p>
                        <p className="text-xs text-foreground-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Invite pending · expires {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classes section */}
        <Card className="bg-gradient-surface border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Classes
            </CardTitle>
            <CardDescription>All classes in your school</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-foreground-muted">Loading...</p>
            ) : classes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-foreground-muted text-sm">No classes yet. Teachers can create classes from their dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl bg-muted/30 border border-card-border hover:border-primary/40 cursor-pointer transition-all group"
                    onClick={() => navigate(`/teacher/class/${cls.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          {cls.grade_level} · {cls.academic_year}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription card */}
        <Card className="bg-gradient-surface border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              Individual student payments are active. School-wide subscription tiers coming in Phase 3.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default SchoolDashboard
