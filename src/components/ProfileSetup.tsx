import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, User, BookOpen, Target } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { dashboardService, CbeSubject, CareerInterest } from '@/lib/dashboard-service'

const profileSchema = z.object({
  schoolLevel: z.enum(['primary', 'secondary', 'tertiary']),
  currentGrade: z.string().optional(),
  subjects: z.array(z.string()).min(3, 'Please select at least 3 CBE subjects'),
  interests: z.array(z.string()).min(2, 'Please select at least 2 career interests'),
  careerGoals: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Updated CBE Curriculum Subjects (2024)
const cbeSubjects = [
  // Core Learning Areas (All levels)
  'Mathematics', 'English', 'Kiswahili', 'Integrated Science',

  // Junior Secondary Learning Areas
  'Social Studies', 'Computer Science', 'Visual Arts', 'Performing Arts',
  'Music', 'Physical Education', 'Health Education', 'Life Skills',
  'Agriculture', 'Home Science', 'Business Studies',

  // Languages
  'French', 'German', 'Arabic', 'Mandarin Chinese',

  // Religious Education
  'Christian Religious Education (CRE)', 'Islamic Religious Education (IRE)',
  'Hindu Religious Education (HRE)',

  // Senior Secondary Specialized Subjects
  'Physics', 'Chemistry', 'Biology', 'Geography', 'History',
  'Economics', 'Literature', 'Film Studies', 'Engineering Studies',

  // Technical & Applied Sciences
  'Technical Drawing', 'Woodwork', 'Metalwork', 'Building Construction',
  'Electrical Studies', 'Mechanical Studies', 'ICT'
]

// Career Interests aligned with Kenya's Vision 2030 and CBE pathways
const careerInterests = [
  // STEM & Technology
  'Technology & Programming', 'Engineering & Construction', 'Digital Innovation',
  'Data Science & Analytics', 'Robotics & AI', 'Renewable Energy',

  // Healthcare & Life Sciences
  'Healthcare & Medicine', 'Biotechnology', 'Public Health', 'Veterinary Sciences',

  // Business & Economics
  'Business & Entrepreneurship', 'Finance & Banking', 'Economics & Trade',
  'Supply Chain & Logistics', 'Marketing & Sales',

  // Creative & Arts
  'Visual Arts & Design', 'Music & Performing Arts', 'Film & Media Production',
  'Fashion & Textile Design', 'Architecture & Interior Design',

  // Agriculture & Environment
  'Agriculture & Food Security', 'Environmental Conservation', 'Climate Change Solutions',
  'Sustainable Development', 'Marine & Fisheries',

  // Social Sciences & Humanities
  'Education & Teaching', 'Law & Justice', 'Social Work & Community Service',
  'Psychology & Counselling', 'International Relations',

  // Other Key Sectors
  'Tourism & Hospitality', 'Sports & Recreation', 'Aviation & Transport',
  'Manufacturing & Industry', 'Research & Development'
]

interface ProfileSetupProps {
  onComplete: () => void
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [dynamicSubjects, setDynamicSubjects] = useState<CbeSubject[]>([])
  const [dynamicInterests, setDynamicInterests] = useState<CareerInterest[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      subjects: [],
      interests: []
    }
  })

  const schoolLevel = watch('schoolLevel')

  // Load dynamic data on component mount
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setIsLoadingData(true)
        const [subjects, interests] = await Promise.all([
          dashboardService.getCbeSubjects(),
          dashboardService.getCareerInterests()
        ])
        setDynamicSubjects(subjects)
        setDynamicInterests(interests)
      } catch (error) {
        console.error('Failed to load dynamic data:', error)
        // Fallback to hardcoded data if API fails
        setDynamicSubjects(cbeSubjects.map(name => ({ id: name, subject_name: name, subject_code: '', category: 'General', description: '', is_active: true, created_at: '' })))
        setDynamicInterests(careerInterests.map(name => ({ id: name, interest_name: name, category: 'General', description: '', related_subjects: [], is_active: true, created_at: '' })))
      } finally {
        setIsLoadingData(false)
      }
    }

    loadDynamicData()
  }, [])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const profileData = {
        user_id: user.id,
        school_level: data.schoolLevel,
        current_grade: data.currentGrade || null,
        cbe_subjects: selectedSubjects,
        career_interests: selectedInterests,
        career_goals: data.careerGoals || null,
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert(profileData)

        if (error) throw error
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubjectToggle = (subject: string) => {
    const updated = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    
    setSelectedSubjects(updated)
    setValue('subjects', updated)
  }

  const handleInterestToggle = (interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest]
    
    setSelectedInterests(updated)
    setValue('interests', updated)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-gradient-surface border-card-border">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete Your CBE Profile</CardTitle>
          <CardDescription>
            Help us understand your CBE learning journey and interests to provide personalized career guidance aligned with Kenya's education system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Education Level */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">CBE Education Level</Label>
              </div>
              <Select onValueChange={(value: 'primary' | 'secondary' | 'tertiary') => setValue('schoolLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your current education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Education (Grades 1-6)</SelectItem>
                  <SelectItem value="secondary">Junior Secondary (Grades 7-9)</SelectItem>
                  <SelectItem value="tertiary">Senior Secondary (Grades 10-12) / Tertiary</SelectItem>
                </SelectContent>
              </Select>
              {errors.schoolLevel && (
                <p className="text-sm text-destructive">{errors.schoolLevel.message}</p>
              )}
            </div>

            {/* Current Grade */}
            {schoolLevel && (
              <div className="space-y-2">
                <Label htmlFor="currentGrade">Current Grade/Year</Label>
                <Input
                  id="currentGrade"
                  placeholder={
                    schoolLevel === 'primary' ? 'e.g., Grade 6' :
                    schoolLevel === 'secondary' ? 'e.g., Grade 8' :
                    'e.g., Grade 11'
                  }
                  {...register('currentGrade')}
                />
              </div>
            )}

            {/* Subjects */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">CBE Learning Areas & Subjects</Label>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Required: {selectedSubjects.length}/3 minimum
                </Badge>
              </div>
              <p className="text-sm text-foreground-muted">
                Select at least 3 CBE learning areas and subjects you're currently studying or have studied. This helps us provide accurate career recommendations aligned with Kenya's Competency Based Curriculum.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {isLoadingData ? (
                  Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-muted animate-pulse">
                      <div className="h-4 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))
                ) : (
                  dynamicSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.subject_name)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedSubjects.includes(subject.subject_name)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-card-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{subject.subject_name}</span>
                    </div>
                  ))
                )}
              </div>
              {errors.subjects && (
                <p className="text-sm text-destructive">{errors.subjects.message}</p>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Career Interests</Label>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Required: {selectedInterests.length}/2 minimum
                </Badge>
              </div>
              <p className="text-sm text-foreground-muted">
                Select at least 2 career fields that interest you most. This helps us provide personalized career recommendations aligned with Kenya's Vision 2030 priorities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {isLoadingData ? (
                  Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-muted animate-pulse">
                      <div className="h-4 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))
                ) : (
                  dynamicInterests.map((interest) => (
                    <div
                      key={interest.id}
                      onClick={() => handleInterestToggle(interest.interest_name)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedInterests.includes(interest.interest_name)
                          ? 'bg-secondary text-secondary-foreground border-secondary'
                          : 'bg-background border-card-border hover:border-secondary/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{interest.interest_name}</span>
                    </div>
                  ))
                )}
              </div>
              {errors.interests && (
                <p className="text-sm text-destructive">{errors.interests.message}</p>
              )}
            </div>

            {/* Career Goals */}
            <div className="space-y-2">
              <Label htmlFor="careerGoals">Career Goals (Optional)</Label>
              <Textarea
                id="careerGoals"
                placeholder="Tell us about your career aspirations, dream job, or what you'd like to achieve professionally..."
                {...register('careerGoals')}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 py-3 text-lg"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Complete Profile & Start AI Chat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
