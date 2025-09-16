import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, GraduationCap, DollarSign, TrendingUp, Clock, MapPin, Users, BookOpen, Target } from 'lucide-react'
import { aiCareerService } from '@/lib/ai-service'

interface CareerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  career: {
    name: string
    value: number
    color: string
    description?: string
    salaryRange?: string
    growth?: string
    education?: string
  }
  studentProfile?: {
    name?: string
    schoolLevel?: string
    currentGrade?: string
    cbeSubjects?: string[]
    careerInterests?: string[]
    strongSubjects?: string[]
    weakSubjects?: string[]
    overallAverage?: number
  }
}

interface CareerDetails {
  title: string
  description: string
  marketValue: string
  salaryRange: string
  requirements: string[]
  nextSteps: string[]
  growthProspect: string
  educationPath: string
  skillsNeeded: string[]
  jobMarket: string
  whyRecommended: string
  relatedCareers: string[]
  timeline: string
  resources: string[]
}

const CareerDetailModal: React.FC<CareerDetailModalProps> = ({ isOpen, onClose, career, studentProfile }) => {
  const [details, setDetails] = useState<CareerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && career) {
      generateCareerDetails()
    }
  }, [isOpen, career])

  const generateCareerDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Enhanced prompt with student details
      const studentInfo = studentProfile ? `
STUDENT PROFILE:
- Name: ${studentProfile.name || 'Student'}
- School Level: ${studentProfile.schoolLevel || 'Not specified'}
- Current Grade: ${studentProfile.currentGrade || 'Not specified'}
- CBE Subjects: ${studentProfile.cbeSubjects?.join(', ') || 'Not specified'}
- Career Interests: ${studentProfile.careerInterests?.join(', ') || 'Not specified'}
- Strong Subjects: ${studentProfile.strongSubjects?.join(', ') || 'Not identified'}
- Weak Subjects: ${studentProfile.weakSubjects?.join(', ') || 'Not identified'}
- Overall Average: ${studentProfile.overallAverage ? `${studentProfile.overallAverage.toFixed(1)}%` : 'Not available'}
` : ''

      const prompt = `Provide detailed career insights for "${career.name}" in Kenya for this specific student. Return ONLY a JSON object:

${studentInfo}
CAREER: ${career.name} (${career.value}% match)

{
  "title": "${career.name}",
  "description": "Detailed description of what this career involves in Kenya and why it's suitable for this student",
  "marketValue": "Current job market demand and opportunities in Kenya, including specific sectors and companies",
  "salaryRange": "Realistic KSh salary range for entry-level to senior positions",
  "requirements": ["Specific educational requirements", "Key skills needed", "Experience requirements"],
  "nextSteps": ["Immediate actionable steps for this student", "Short-term goals", "Long-term career path"],
  "growthProspect": "Growth outlook in Kenya, including Vision 2030 alignment and emerging opportunities",
  "educationPath": "Specific educational pathway including universities, courses, and certifications in Kenya",
  "skillsNeeded": ["Technical skills", "Soft skills", "Industry-specific skills"],
  "jobMarket": "Current market status, competition level, and hiring trends in Kenya",
  "whyRecommended": "Specific reasons why this career fits this student based on their profile and academic performance",
  "relatedCareers": ["Alternative career paths", "Specialized roles", "Career progression options"],
  "timeline": "Realistic timeline to enter this career from their current position",
  "resources": ["Specific Kenyan universities", "Professional associations", "Online courses", "Mentorship programs", "Industry contacts"]
}

Focus on:
- Kenyan context and opportunities
- Specific advice based on student's academic performance
- Subjects they should focus on to succeed
- Practical steps they can take now
- Realistic expectations and timelines
- Vision 2030 alignment`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Career Finder'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setDetails(parsed)
          return
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
      }

      // Fallback to static details if AI fails
      setDetails({
        title: career.name,
        description: career.description || `A ${career.name} is a promising career path that aligns with your interests and academic background. This role offers good growth potential in Kenya's evolving job market.`,
        marketValue: 'Growing demand in Kenya with increasing opportunities in both public and private sectors',
        salaryRange: career.salaryRange || 'KSh 60,000 - 200,000',
        requirements: [
          'Relevant degree or professional certification',
          'Strong communication and analytical skills',
          'Practical experience through internships or projects',
          'Continuous learning and skill development'
        ],
        nextSteps: [
          'Complete your current education with focus on relevant subjects',
          'Seek internships or volunteer opportunities in related fields',
          'Build a strong professional network',
          'Consider additional certifications or short courses',
          'Create a portfolio showcasing your skills and projects'
        ],
        growthProspect: career.growth || 'Strong growth potential with expanding opportunities',
        educationPath: career.education || 'Bachelor\'s degree in relevant field recommended',
        skillsNeeded: ['Critical thinking', 'Communication', 'Problem solving', 'Technical skills', 'Teamwork'],
        jobMarket: 'Competitive but growing market with opportunities in various sectors',
        whyRecommended: `This career matches your ${career.value}% compatibility score and aligns with your interests and academic strengths.`,
        relatedCareers: ['Similar roles in related fields', 'Alternative career paths', 'Specialized positions'],
        timeline: '2-4 years to entry level, with advancement opportunities',
        resources: [
          'Professional associations and networks',
          'Online courses and certifications',
          'Mentorship programs',
          'Industry conferences and workshops'
        ]
      })
    } catch (error) {
      console.error('Error generating career details:', error)
      setError('Unable to load detailed information. Showing basic details instead.')
      
      // Even if AI fails, show basic details
      setDetails({
        title: career.name,
        description: career.description || `A ${career.name} is a career path that matches your profile with a ${career.value}% compatibility score.`,
        marketValue: 'Growing opportunities in Kenya',
        salaryRange: career.salaryRange || 'KSh 50,000 - 150,000',
        requirements: ['Relevant education', 'Practical skills', 'Experience'],
        nextSteps: ['Complete education', 'Gain experience', 'Build network'],
        growthProspect: career.growth || 'Good potential',
        educationPath: career.education || 'Degree recommended',
        skillsNeeded: ['Communication', 'Problem solving', 'Technical skills'],
        jobMarket: 'Competitive market',
        whyRecommended: `Matches your profile with ${career.value}% compatibility`,
        relatedCareers: ['Similar roles'],
        timeline: '2-4 years',
        resources: ['Professional networks', 'Online courses']
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" style={{ color: career.color }} />
            {career.name}
            <Badge variant="secondary" className="ml-2">
              {career.value}% Match
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Generating career insights...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={generateCareerDetails}>Try Again</Button>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Career Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{details.description}</p>
                <p className="text-sm text-gray-600 italic">"{details.whyRecommended}"</p>
              </CardContent>
            </Card>

            {/* Market Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    Salary & Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Salary Range:</span>
                      <p className="text-green-600 font-semibold">{details.salaryRange}</p>
                    </div>
                    <div>
                      <span className="font-medium">Market Value:</span>
                      <p className="text-sm text-gray-600">{details.marketValue}</p>
                    </div>
                    <div>
                      <span className="font-medium">Growth Prospect:</span>
                      <p className="text-sm text-gray-600">{details.growthProspect}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Job Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Current Market:</span>
                      <p className="text-sm text-gray-600">{details.jobMarket}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span>
                      <p className="text-sm text-gray-600">{details.timeline}</p>
                    </div>
                    <div>
                      <span className="font-medium">Education Path:</span>
                      <p className="text-sm text-gray-600">{details.educationPath}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Requirements & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {details.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.skillsNeeded.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {details.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Related Careers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Career Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.relatedCareers.map((relatedCareer, index) => (
                    <Badge key={index} variant="secondary">
                      {relatedCareer}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {details.resources.map((resource, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={generateCareerDetails} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CareerDetailModal
