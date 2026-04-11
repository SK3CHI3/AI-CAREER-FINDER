import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService, type School } from '@/lib/school-service'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users, Building2, ChevronLeft, LogOut,
  RefreshCw, Search, GraduationCap
} from 'lucide-react'

const SchoolStudents: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const [school, setSchool] = useState<School | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const mySchool = await schoolService.getMySchool(user.id)
      if (!mySchool) {
        navigate('/school')
        return
      }
      setSchool(mySchool)
      const data = await schoolService.getSchoolStudents(mySchool.id)
      setStudents(data)
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const initials = (name: string | null) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : 'S'

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.upi_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/school')} className="mr-2 hidden md:flex">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <img
                src="/logos/CareerGuide_Logo.webp"
                alt="CareerGuide AI"
                className="h-10 w-auto cursor-pointer"
                onClick={() => navigate('/school')}
              />
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mt-1 hidden sm:inline-flex">School Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center gap-2 hidden md:flex">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">{school?.name ?? 'School'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={loadData} title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{initials(profile?.full_name ?? null)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" className="hidden sm:flex">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 md:hidden">
              <Button variant="ghost" size="sm" className="px-2 h-8" onClick={() => navigate('/school')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Student Roster
            </h1>
            <p className="text-foreground-muted text-sm mt-1 max-w-2xl">
              A comprehensive list of all students enrolled in classes belonging to {school?.name}.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-background/50 border-card-border"
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        <Card className="bg-gradient-surface border-card-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary/40" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center p-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary opacity-80" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No Students Found</h3>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                  {searchQuery ? "No students match your search criteria." : "There are no students enrolled in any of your school's classes yet."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-card-border/50">
                {filteredStudents.map((student, idx) => (
                  <div key={student.user_id || idx} className="p-4 sm:p-6 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border border-card-border/50 shadow-sm">
                        <AvatarFallback className="bg-background">{initials(student.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">{student.full_name}</h3>
                          {!student.user_id && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 uppercase font-medium bg-orange-500/10 text-orange-500 border-orange-500/20">Pending Reg.</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground-muted">
                          <span className="font-mono text-xs">{student.upi_number || 'No UPI'}</span>
                          {student.email && student.email !== 'N/A' && !student.email.endsWith('@student.careerguideai.co.ke') && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-xs">{student.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">
                      {student.classes.slice(0, 3).map((cls: any, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border border-primary/10 flex flex-col items-start px-2 py-1 font-normal">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{cls.grade}</span>
                          <span className="text-xs truncate max-w-[120px]">{cls.name}</span>
                        </Badge>
                      ))}
                      {student.classes.length > 3 && (
                        <Badge variant="secondary" className="bg-muted text-foreground-muted">+{student.classes.length - 3} more</Badge>
                      )}
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

export default SchoolStudents
