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

const CareerDetailModal: React.FC<CareerDetailModalProps> = ({ isOpen, onClose, career }) => {
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
      const prompt = `Generate detailed career information for "${career.name}" in the Kenyan context. Return a JSON object with the following structure:

{
  "title": "Career Title",
  "description": "Detailed description of what this career involves",
  "marketValue": "Current market demand and opportunities in Kenya",
  "salaryRange": "Salary range in KES (e.g., KSh 50,000-150,000)",
  "requirements": ["List of specific requirements"],
  "nextSteps": ["Actionable steps to pursue this career"],
  "growthProspect": "Growth potential and future outlook",
  "educationPath": "Educational requirements and pathways",
  "skillsNeeded": ["Key skills required"],
  "jobMarket": "Current job market situation in Kenya",
  "whyRecommended": "Why this career is recommended for the student",
  "relatedCareers": ["List of related career options"],
  "timeline": "Typical timeline to enter this career",
  "resources": ["Useful resources, websites, or organizations"]
}

Focus on:
- Kenyan job market and opportunities
- CBE curriculum alignment
- Realistic salary expectations
- Specific universities and institutions
- Practical steps the student can take now
- Free or affordable resources
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
          max_tokens: 2000
        })
      })

      if (!response.ok) throw new Error('Failed to get career details')

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setDetails(parsed)
        } else {
          throw new Error('Could not parse AI response')
        }
      } catch (parseError) {
        // Fallback details
        setDetails({
          title: career.name,
          description: career.description || 'A promising career path for your profile',
          marketValue: 'Growing demand in Kenya',
          salaryRange: career.salaryRange || 'KSh 50,000-150,000',
          requirements: ['Relevant degree or certification', 'Practical experience', 'Key skills'],
          nextSteps: ['Complete your education', 'Gain practical experience', 'Build your network'],
          growthProspect: career.growth || 'Good growth potential',
          educationPath: career.education || 'University degree recommended',
          skillsNeeded: ['Technical skills', 'Communication', 'Problem solving'],
          jobMarket: 'Competitive but growing market',
          whyRecommended: 'Matches your interests and skills',
          relatedCareers: ['Similar roles', 'Alternative paths'],
          timeline: '2-4 years to entry level',
          resources: ['Professional associations', 'Online courses', 'Mentorship programs']
        })
      }
    } catch (error) {
      console.error('Error generating career details:', error)
      setError('Failed to load career details. Please try again.')
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
