import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart2, Brain, Briefcase, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react'

interface InsightsProps {
  schoolId: string
}

interface InsightData {
  aiChatCount: number
  assessmentsCompleted: number
  gradeUploads: number
  topCareers: { name: string; count: number }[]
  activeStudents: number
}

const SchoolInsights: React.FC<InsightsProps> = ({ schoolId }) => {
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        // Get student user IDs enrolled in school's classes
        const { data: classes } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', schoolId)

        const classIds = (classes ?? []).map((c) => c.id)

        // Students enrolled in school classes
        let studentIds: string[] = []
        if (classIds.length > 0) {
          const { data: enrollments } = await supabase
            .from('class_enrollments')
            .select('student_user_id')
            .in('class_id', classIds)
            .not('student_user_id', 'is', null)
          studentIds = [...new Set((enrollments ?? []).map((e) => e.student_user_id as string))]
        }

        // Also get students directly linked via school_id in profiles
        const { data: profileStudents } = await supabase
          .from('profiles')
          .select('id')
          .eq('school_id', schoolId)
          .eq('role', 'student')
        const profileIds = (profileStudents ?? []).map((p) => p.id)
        const allStudentIds = [...new Set([...studentIds, ...profileIds])]

        // AI chat activity
        let aiChatCount = 0
        let assessmentsCompleted = 0
        let topCareers: { name: string; count: number }[] = []

        if (allStudentIds.length > 0) {
          const { data: activities } = await supabase
            .from('user_activities')
            .select('activity_type, activity_title')
            .in('user_id', allStudentIds)

          const acts = activities ?? []
          aiChatCount = acts.filter((a) => a.activity_type === 'ai_chat' || a.activity_type === 'chat').length
          assessmentsCompleted = acts.filter((a) =>
            a.activity_type === 'assessment' || a.activity_type === 'riasec_assessment'
          ).length

          // Career interests from profiles
          const { data: profiles } = await supabase
            .from('profiles')
            .select('career_interests')
            .in('id', allStudentIds)

          const careerCounts: Record<string, number> = {}
          ;(profiles ?? []).forEach((p) => {
            ;(p.career_interests ?? []).forEach((c: string) => {
              careerCounts[c] = (careerCounts[c] ?? 0) + 1
            })
          })
          topCareers = Object.entries(careerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }))
        }

        // Grade uploads
        let gradeUploads = 0
        if (classIds.length > 0) {
          const { count } = await supabase
            .from('student_grades')
            .select('id', { count: 'exact', head: true })
            .eq('source', 'teacher_upload')
          gradeUploads = count ?? 0
        }

        setData({
          aiChatCount,
          assessmentsCompleted,
          gradeUploads,
          topCareers,
          activeStudents: allStudentIds.length,
        })
      } catch (err) {
        console.error('School insights fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [schoolId])

  const metrics = data
    ? [
        { label: 'Active Students', value: data.activeStudents, icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-400/10' },
        { label: 'AI Chat Sessions', value: data.aiChatCount, icon: MessageSquare, color: 'text-violet-400', bg: 'bg-violet-400/10' },
        { label: 'Assessments Done', value: data.assessmentsCompleted, icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Grade Uploads', value: data.gradeUploads, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
      ]
    : []

  return (
    <Card className="bg-gradient-surface border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Briefcase className="w-5 h-5 text-primary" />
          School Insights
        </CardTitle>
        <CardDescription>Real-time student activity across your institution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary/40" />
          </div>
        ) : (
          <>
            {/* Metric strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {metrics.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                  key={label}
                  className={`rounded-xl p-4 ${bg} border border-white/5 flex flex-col gap-1`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <p className={`text-2xl font-black ${color} tabular-nums`}>{value}</p>
                  <p className="text-[10px] text-foreground-muted uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Top Career Interests */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Top Career Interests</p>
              {data?.topCareers.length === 0 ? (
                <p className="text-sm text-foreground-muted opacity-60">
                  No career interest data yet. Students need to complete an assessment.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.topCareers.map((c) => (
                    <Badge
                      key={c.name}
                      variant="secondary"
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {c.name}
                      <span className="ml-1.5 opacity-60">× {c.count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SchoolInsights
