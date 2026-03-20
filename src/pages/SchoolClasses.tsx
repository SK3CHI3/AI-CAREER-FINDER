import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService, type School } from '@/lib/school-service'
import { classService, type ClassRecord } from '@/lib/class-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    ArrowLeft, Bot, Building2, LogOut, BookOpen,
    ChevronRight, RefreshCw, Users, Layers
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const SchoolClasses: React.FC = () => {
    const navigate = useNavigate()
    const { user, profile, signOut } = useAuth()

    const [school, setSchool] = useState<School | null>(null)
    const [classes, setClasses] = useState<ClassRecord[]>([])
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

            const classList = await classService.getSchoolClasses(mySchool.id)
            setClasses(classList)
        } catch (err) {
            console.error('School classes load error:', err)
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
                            <img
                                src="/logos/CareerGuide_Logo.png"
                                alt="CareerGuide AI"
                                className="h-10 w-auto"
                            />
                            <span className="text-foreground-muted">·</span>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-medium text-foreground text-sm">{school?.name}</span>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <ThemeToggle />
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
                            <BookOpen className="w-6 h-6 text-primary" />
                            Class Management
                        </h1>
                        <p className="text-foreground-muted text-sm mt-1">
                            Browse and monitor all academic classes at {school?.name}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh List
                    </Button>
                </div>

                <Card className="bg-gradient-surface border-card-border">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Academic Classes</CardTitle>
                                <CardDescription>Managed by teachers across different grade levels</CardDescription>
                            </div>
                            <Badge variant="outline">{classes.length} Total</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {classes.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                                <p className="text-foreground-muted">No classes have been established yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {classes.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="p-5 rounded-2xl bg-muted/30 border border-card-border hover:border-primary/40 cursor-pointer transition-all group relative overflow-hidden"
                                        onClick={() => navigate(`/teacher/class/${cls.id}`)}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{cls.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 uppercase letter-spacing-wider">
                                                            {cls.grade_level}
                                                        </Badge>
                                                        <span className="text-[10px] text-foreground-muted">{cls.academic_year}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-foreground-muted">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        <span>Roster Active</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Layers className="w-3.5 h-3.5" />
                                                        <span>CBE Aligned</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default SchoolClasses
