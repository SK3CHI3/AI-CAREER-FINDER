import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService, type School, type TeacherProfile, type TeacherInvite } from '@/lib/school-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    ArrowLeft, Bot, Building2, LogOut, GraduationCap,
    Mail, Clock, Trash2, RefreshCw, Plus, UserPlus
} from 'lucide-react'
import InviteTeacher from '@/components/school/InviteTeacher'

const SchoolTeachers: React.FC = () => {
    const navigate = useNavigate()
    const { user, profile, signOut } = useAuth()

    const [school, setSchool] = useState<School | null>(null)
    const [teachers, setTeachers] = useState<TeacherProfile[]>([])
    const [pendingInvites, setPendingInvites] = useState<TeacherInvite[]>([])
    const [loading, setLoading] = useState(true)

    const loadData = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const mySchool = await schoolService.getMySchool(user.id)
            if (!mySchool) {
                navigate('/school')
                return
            }

            setSchool(mySchool)

            const [teacherList, invites] = await Promise.allSettled([
                schoolService.getSchoolTeachers(mySchool.id),
                schoolService.getPendingInvites(mySchool.id),
            ])

            if (teacherList.status === 'fulfilled') setTeachers(teacherList.value)
            if (invites.status === 'fulfilled') setPendingInvites(invites.value)
        } catch (err) {
            console.error('School teachers load error:', err)
        } finally {
            setLoading(false)
        }
    }, [user, navigate])

    useEffect(() => { loadData() }, [loadData])

    const initials = (name: string | null) =>
        name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?'

    if (loading && !school) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-homepage)' }}>
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
            {/* Header */}
            <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 h-16">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/school')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">CareerGuide AI</span>
                            <span className="text-foreground-muted">·</span>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground text-sm">{school?.name}</span>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <Badge variant="secondary">School Admin</Badge>
                            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-primary" />
                            Teacher Management
                        </h1>
                        <p className="text-foreground-muted text-sm mt-1">
                            Invite and manage teachers for {school?.name}
                        </p>
                    </div>
                    {school && user && (
                        <InviteTeacher
                            schoolId={school.id}
                            invitedBy={user.id}
                            onInvited={loadData}
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="bg-gradient-surface border-card-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>School Members</CardTitle>
                                    <CardDescription>Active teachers and administrators</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={loadData}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {teachers.length === 0 ? (
                                <div className="text-center py-12">
                                    <GraduationCap className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                                    <p className="text-foreground-muted">No active teachers found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {teachers.map((t) => (
                                        <div key={t.user_id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-card-border hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback className="text-sm shadow-sm">{initials(t.full_name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-foreground">{t.full_name ?? t.email}</p>
                                                    <p className="text-xs text-foreground-muted">{t.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={t.school_role === 'school_admin' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 h-4">
                                                            {t.school_role === 'school_admin' ? 'Admin' : 'Teacher'}
                                                        </Badge>
                                                        <span className="text-[10px] text-foreground-muted">Joined {new Date(t.joined_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {t.school_role !== 'school_admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={async () => {
                                                            if (!school) return
                                                            if (!window.confirm(`Are you sure you want to remove ${t.full_name ?? t.email}?`)) return
                                                            try {
                                                                await schoolService.removeTeacher(school.id, t.user_id)
                                                                loadData()
                                                            } catch (err) {
                                                                console.error('Error removing teacher:', err)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {pendingInvites.length > 0 && (
                        <Card className="bg-gradient-surface border-card-border overflow-hidden">
                            <CardHeader className="bg-muted/10">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-warning" />
                                    Pending Invitations
                                </CardTitle>
                                <CardDescription>Invites sent that haven't been accepted yet</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingInvites.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-dashed border-card-border opacity-80">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-foreground-muted" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{inv.email}</p>
                                                    <p className="text-xs text-foreground-muted flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Expires {new Date(inv.expires_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">Pending</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}

export default SchoolTeachers
