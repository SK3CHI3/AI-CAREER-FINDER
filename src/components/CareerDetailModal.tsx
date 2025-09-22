import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, GraduationCap, DollarSign, TrendingUp, Clock, MapPin, Users, BookOpen, Target } from 'lucide-react'
import { aiCacheService } from '@/lib/ai-cache-service'
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
    console.log('🚀 Starting career details generation for:', career.name)
    setIsLoading(true)
    setError(null)

    try {
      // First check if we have cached details
      if (studentProfile?.id) {
        const cachedDetails = await aiCacheService.getCachedCareerDetails(studentProfile.id, career.name)
        if (cachedDetails) {
          console.log('✅ Using cached career details')
          setDetails(cachedDetails)
          setIsLoading(false)
          return
        }
      }

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
      const baseUrl = 'https://api.deepseek.com'
      const modelName = 'deepseek-chat'
      
      if (!apiKey) {
        console.error('❌ No API key found')
        throw new Error('API key not configured')
      }

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

      const prompt = `Provide detailed career insights for "${career.name}" in Kenya. Return ONLY a JSON object:

${studentInfo}
CAREER: ${career.name} (${career.value}% match)

{
  "title": "${career.name}",
  "description": "What this career involves in Kenya",
  "marketValue": "Job market demand in Kenya",
  "salaryRange": "KSh range for this role",
  "requirements": ["Key requirements"],
  "nextSteps": ["Steps to pursue this career"],
  "growthProspect": "Growth outlook",
  "educationPath": "Education needed",
  "skillsNeeded": ["Important skills"],
  "jobMarket": "Current market status",
  "whyRecommended": "Why this career fits",
  "relatedCareers": ["Similar careers"],
  "timeline": "Time to enter this career",
  "resources": ["Helpful resources"]
}

Keep it concise and Kenya-focused.`

      console.log('📤 Sending API request...')
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          stream: true
        })
      })

      console.log('📥 API Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('❌ DeepSeek API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`AI service error: ${response.status} - ${response.statusText}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      const decoder = new TextDecoder()
      let aiResponse = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.choices?.[0]?.delta?.content) {
                  aiResponse += parsed.choices[0].delta.content
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      console.log('🤖 AI Response:', aiResponse)

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('✅ Parsed AI response successfully:', parsed)
          setDetails(parsed)
          
          // Save to cache
          if (studentProfile?.id) {
            await aiCacheService.saveCareerDetails(studentProfile.id, career.name, parsed)
          }
          return
        } else {
          console.warn('⚠️ No JSON found in AI response')
        }
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError)
      }

      // Fallback to static details if AI fails
      console.log('🔄 Using fallback details')
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
      console.error('❌ Error generating career details:', error)
      setError(`Unable to load detailed information: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Even if AI fails, show basic details
      console.log('🔄 Using basic fallback details')
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
      console.log('✅ Career details generation completed')
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
