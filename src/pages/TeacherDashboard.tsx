/**
 * Teacher dashboard – Phase 0 placeholder.
 * Phase 1: classes, spreadsheet grade upload, student list.
 */
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Bot, LogOut } from 'lucide-react'

const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth()

  const getInitials = (name: string | null) => {
    if (!name) return 'T'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-text bg-clip-text text-transparent">
                CareerPath AI
              </h1>
              <span className="text-foreground-muted">·</span>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Teacher</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name || user?.email || 'Teacher'}
                  </p>
                  <Badge variant="secondary">teacher</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Teacher Dashboard</h2>
            <p className="text-foreground-muted text-sm">Classes & grade upload – coming in Phase 1</p>
          </div>
        </div>

        <Card className="bg-gradient-surface border-card-border">
          <CardHeader>
            <CardTitle>Welcome, {profile?.full_name || user?.email}</CardTitle>
            <CardDescription>
              Manage classes and upload grades (spreadsheet) will be available here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              You're signed in as a <strong>teacher</strong>. Phase 0 complete – database and roles are ready.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeacherDashboard
