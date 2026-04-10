import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { schoolService } from '@/lib/school-service'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Bot, Download, Lightbulb, RefreshCw, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

interface InsightData {
  paragraph1: string
  paragraph2: string
  topCareers: string[]
  schoolName: string
  generatedAt: string
}

const SchoolInsightsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildPrompt = (schoolName: string, careers: string[], studentCount: number, assessmentCount: number) => {
    const careerList = careers.length > 0 ? careers.join(', ') : 'Technology, Healthcare, Business, Engineering'
    return `You are an AI school counselling analyst for CareerGuide AI, a Kenyan educational platform.

A school named "${schoolName}" has ${studentCount} active students. ${assessmentCount} assessments have been completed.
The most trending career interests among their students are: ${careerList}.

Write EXACTLY 2 paragraphs of school-specific insights for the school principal/admin. Be warm, professional, and action-oriented.

PARAGRAPH 1: Analyse the career interest trends. Comment on what the data signals about students' aspirations. Mention specific career fields and what they suggest about the student body's personality and goals.

PARAGRAPH 2: Provide ONE specific, concrete institutional recommendation. For example: if medicine/healthcare is trending, suggest inviting a physician or nurse for a career talk. If technology is top, suggest a coding bootcamp partnership. Be specific — name the type of professional, the format of the activity, and the expected outcome.

DO NOT use markdown formatting like ** or ##. Write in clean, natural, professional prose. Keep each paragraph to 3-4 sentences max. Sound insightful and human, not robotic.`
  }

  const generateInsights = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const school = await schoolService.getMySchool(user.id)
      if (!school) throw new Error('School not found')

      // Fetch career interests from enrolled students
      const { data: classes } = await supabase.from('classes').select('id').eq('school_id', school.id)
      const classIds = (classes ?? []).map((c) => c.id)

      let studentIds: string[] = []
      if (classIds.length > 0) {
        const { data: enroll } = await supabase
          .from('class_enrollments')
          .select('student_user_id')
          .in('class_id', classIds)
          .not('student_user_id', 'is', null)
        studentIds = [...new Set((enroll ?? []).map((e) => e.student_user_id as string))]
      }
      const { data: profileStudents } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', school.id)
        .eq('role', 'student')
      const profileIds = (profileStudents ?? []).map((p) => p.id)
      const allIds = [...new Set([...studentIds, ...profileIds])]

      let topCareers: string[] = []
      let assessmentCount = 0
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('career_interests')
          .in('id', allIds)
        const counts: Record<string, number> = {}
        ;(profiles ?? []).forEach((p) => {
          ;(p.career_interests ?? []).forEach((c: string) => {
            counts[c] = (counts[c] ?? 0) + 1
          })
        })
        topCareers = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => name)

        const { data: acts } = await supabase
          .from('user_activities')
          .select('id', { count: 'exact', head: false })
          .in('user_id', allIds)
          .in('activity_type', ['assessment', 'riasec_assessment'])
        assessmentCount = acts?.length ?? 0
      }

      // Call DeepSeek
      const prompt = buildPrompt(school.name, topCareers, allIds.length, assessmentCount)
      const resp = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.75,
          max_tokens: 500,
          stream: false,
        }),
      })

      if (!resp.ok) throw new Error(`AI error: ${resp.status}`)
      const json = await resp.json()
      const text: string = json.choices?.[0]?.message?.content ?? ''

      // Split into 2 paragraphs
      const paras = text
        .split(/\n\n+/)
        .map((p: string) => p.trim())
        .filter(Boolean)
      const paragraph1 = paras[0] ?? text
      const paragraph2 = paras[1] ?? ''

      setInsights({
        paragraph1,
        paragraph2,
        topCareers,
        schoolName: school.name,
        generatedAt: new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' }),
      })
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    generateInsights()
  }, [generateInsights])

  const downloadPDF = async () => {
    if (!insights) return
    // Dynamic import to avoid bundle bloat
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentW = pageW - margin * 2
    let y = 20

    // Header
    doc.setFillColor(99, 102, 241) // indigo-500
    doc.rect(0, 0, pageW, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('CareerGuide AI', margin, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('School Insights Report', margin, y + 18)
    doc.setFontSize(9)
    doc.text(insights.schoolName, margin, y + 26)
    doc.text(`Generated: ${insights.generatedAt}`, margin, y + 33)

    y = 60

    // Top Careers strip
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TOP CAREER INTERESTS', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(99, 102, 241)
    doc.text(insights.topCareers.join('  ·  '), margin, y)
    y += 12

    // Divider
    doc.setDrawColor(200, 200, 220)
    doc.line(margin, y, pageW - margin, y)
    y += 10

    // Paragraph 1
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TRENDS ANALYSIS', margin, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const p1Lines = doc.splitTextToSize(insights.paragraph1, contentW)
    doc.text(p1Lines, margin, y)
    y += p1Lines.length * 5 + 10

    // Paragraph 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('INSTITUTIONAL RECOMMENDATION', margin, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const p2Lines = doc.splitTextToSize(insights.paragraph2, contentW)
    doc.text(p2Lines, margin, y)
    y += p2Lines.length * 5 + 15

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Powered by CareerGuide AI · careerguide.ai', margin, doc.internal.pageSize.getHeight() - 12)

    doc.save(`${insights.schoolName.replace(/\s+/g, '_')}_CareerGuide_Insights.pdf`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-homepage)' }}>
      {/* Header */}
      <header className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/school')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img
                src="/logos/CareerGuide_Logo.webp"
                alt="CareerGuide AI"
                className="h-10 w-auto"
              />
              <span className="text-lg font-bold bg-gradient-text bg-clip-text text-transparent ml-2">
                School Insights
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={generateInsights} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              {insights && (
                <Button size="sm" onClick={downloadPDF} className="bg-gradient-primary text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">AI-Generated School Report</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Insights derived from your students' career interests and activity — generated by CareerGuide AI.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <Card className="bg-gradient-surface border-card-border">
            <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <p className="text-foreground-muted text-sm">CareerGuide AI is analysing your school's data…</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">{error}</p>
              <Button onClick={generateInsights} variant="outline" className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        {insights && !loading && (
          <>
            {/* Top Careers */}
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Top Career Interests Among Your Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insights.topCareers.length > 0 ? (
                    insights.topCareers.map((c, i) => (
                      <Badge
                        key={c}
                        variant="secondary"
                        className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        #{i + 1} {c}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-foreground-muted">No career interest data yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Insight paragraphs */}
            <Card className="bg-gradient-surface border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Insights Report
                </CardTitle>
                <CardDescription>{insights.schoolName} · {insights.generatedAt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Trends Analysis</p>
                  <p className="text-foreground leading-relaxed text-[15px]">{insights.paragraph1}</p>
                </div>
                {insights.paragraph2 && (
                  <div className="border-t border-card-border pt-6">
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Institutional Recommendation</p>
                    <p className="text-foreground leading-relaxed text-[15px]">{insights.paragraph2}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download CTA */}
            <div className="flex justify-end">
              <Button onClick={downloadPDF} size="lg" className="bg-gradient-primary text-primary-foreground gap-2 px-8">
                <Download className="w-5 h-5" />
                Download as PDF
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default SchoolInsightsPage
