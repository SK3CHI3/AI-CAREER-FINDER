import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Clock, Users, Star, Loader2, BookOpen, Award, Globe } from 'lucide-react'
import { aiCacheService } from '@/lib/ai-cache-service'
import { useAuth } from '@/contexts/AuthContext'

interface CourseRecommendation {
  title: string
  provider: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  students: number
  description: string
  skills: string[]
  link: string
  free: boolean
  language: string
  certificate: boolean
  whyRecommended: string
}

interface CourseRecommendationsProps {
  careerInterests?: string[]
  cbeSubjects?: string[]
  strongSubjects?: string[]
}

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  careerInterests = [],
  cbeSubjects = [],
  strongSubjects = []
}) => {
  const [courses, setCourses] = useState<CourseRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    // First check for cached courses
    const loadCachedCourses = async () => {
      if (user?.id) {
        const cachedCourses = await aiCacheService.getCachedCourseRecommendations(user.id)
        if (cachedCourses && cachedCourses.length > 0) {
          console.log('✅ Using cached course recommendations')
          setCourses(cachedCourses)
          setIsLoading(false)
          return
        }
      }
      // If no cache, generate new recommendations
      generateCourseRecommendations()
    }
    
    loadCachedCourses()
  }, [careerInterests, cbeSubjects, strongSubjects, user?.id])

  const generateCourseRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const prompt = `Generate 3 free online course recommendations for a Kenyan student based on their profile. Return a JSON array:

Student Profile:
- Career Interests: ${careerInterests.join(', ') || 'General learning'}
- CBE Subjects: ${cbeSubjects.join(', ') || 'Not specified'}
- Strong Subjects: ${strongSubjects.join(', ') || 'Not specified'}

Return exactly this format:
[
  {
    "title": "Course Title",
    "provider": "Platform Name (e.g., Coursera, edX, Khan Academy)",
    "duration": "X weeks/hours",
    "difficulty": "Beginner/Intermediate/Advanced",
    "rating": 4.5,
    "students": 10000,
    "description": "Brief description of what the course covers",
    "skills": ["Skill 1", "Skill 2", "Skill 3"],
    "link": "https://example.com/course",
    "free": true,
    "language": "English",
    "certificate": true,
    "whyRecommended": "Why this course is recommended for this student"
  }
]

Focus on:
- FREE courses only
- Courses relevant to Kenyan job market
- Skills that complement CBE curriculum
- Practical, hands-on learning
- Courses that can be completed in 2-8 weeks
- Popular platforms like Coursera, edX, Khan Academy, YouTube, Udemy (free courses)
- Skills that align with their career interests and strong subjects`

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
          max_tokens: 1500
        })
      })

      if (!response.ok) throw new Error('Failed to get course recommendations')

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed)
            
            // Save to cache
            if (user?.id) {
              await aiCacheService.saveCourseRecommendations(user.id, parsed)
            }
          } else {
            throw new Error('Invalid course data format')
          }
        } else {
          throw new Error('Could not parse course recommendations')
        }
      } catch (parseError) {
        // Fallback courses
        setCourses([
          {
            title: "Introduction to Digital Skills",
            provider: "Coursera",
            duration: "4 weeks",
            difficulty: "Beginner",
            rating: 4.6,
            students: 50000,
            description: "Learn essential digital skills for the modern workplace",
            skills: ["Digital Literacy", "Computer Basics", "Online Communication"],
            link: "https://coursera.org/learn/digital-skills",
            free: true,
            language: "English",
            certificate: true,
            whyRecommended: "Builds foundational digital skills needed for most careers"
          },
          {
            title: "Mathematics for Data Science",
            provider: "Khan Academy",
            duration: "6 weeks",
            difficulty: "Intermediate",
            rating: 4.8,
            students: 100000,
            description: "Master mathematical concepts used in data analysis and science",
            skills: ["Statistics", "Algebra", "Data Analysis"],
            link: "https://khanacademy.org/math",
            free: true,
            language: "English",
            certificate: false,
            whyRecommended: "Strengthens mathematical foundation for analytical careers"
          },
          {
            title: "Communication Skills for Success",
            provider: "edX",
            duration: "3 weeks",
            difficulty: "Beginner",
            rating: 4.7,
            students: 75000,
            description: "Develop effective communication skills for professional success",
            skills: ["Public Speaking", "Writing", "Presentation"],
            link: "https://edx.org/learn/communication",
            free: true,
            language: "English",
            certificate: true,
            whyRecommended: "Essential soft skills for any career path"
          }
        ])
      }
    } catch (error) {
      console.error('Error generating course recommendations:', error)
      setError('Failed to load course recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Finding the best courses for you...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={generateCourseRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recommended Free Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                  <p className="text-xs text-blue-600 italic">"{course.whyRecommended}"</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="secondary" className="text-xs">
                    {course.provider}
                  </Badge>
                  {course.free && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      FREE
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {course.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </div>
                {course.certificate && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-blue-500" />
                    Certificate
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  {course.skills.slice(0, 3).map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(course.link, '_blank')}
                  className="ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Enroll
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={generateCourseRecommendations}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseRecommendations
