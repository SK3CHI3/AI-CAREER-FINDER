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
import { Loader2, CheckCircle, User, BookOpen, Target, Sparkles, Brain, Briefcase, Heart, Lightbulb, Compass, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { dashboardService, CbeSubject, CareerInterest } from '@/lib/dashboard-service'
import { RIASEC_ACTIVITIES, RIASEC_LABELS } from '@/data/riasec-assessment'

const profileSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number (e.g. 0712345678)'),
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
  onComplete: (isPaymentComplete: boolean) => void
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [dynamicSubjects, setDynamicSubjects] = useState<CbeSubject[]>([])
  const [dynamicInterests, setDynamicInterests] = useState<CareerInterest[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const calculateRiasec = () => {
    const scores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0
    };

    selectedActivities.forEach(id => {
      const activity = RIASEC_ACTIVITIES.find(a => a.id === id);
      if (activity) {
        if (activity.code === 'R') scores.realistic++;
        if (activity.code === 'I') scores.investigative++;
        if (activity.code === 'A') scores.artistic++;
        if (activity.code === 'S') scores.social++;
        if (activity.code === 'E') scores.enterprising++;
        if (activity.code === 'C') scores.conventional++;
      }
    });

    const sortedTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)
      .map(([type]) => RIASEC_LABELS[type.charAt(0).toUpperCase()]);

    return { scores, personalityTypes: sortedTypes };
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: user?.user_metadata?.phone || '',
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
      const { scores, personalityTypes } = calculateRiasec();

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      const profileData = {
        phone: data.phone,
        school_level: data.schoolLevel,
        current_grade: data.currentGrade || null,
        cbe_subjects: selectedSubjects,
        career_interests: selectedInterests,
        career_goals: data.careerGoals || null,
        assessment_results: {
          riasec_scores: scores,
          personality_type: personalityTypes,
          interests: selectedInterests,
          subjects: selectedSubjects
        },
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert(profileData)

        if (error) throw error
      }

      // Refresh profile in auth context to get latest data
      console.log('Profile saved successfully, refreshing auth context...')
      await refreshProfile()

      // Check payment status after profile completion
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('payment_status')
        .eq('id', user.id)
        .single()

      console.log('Payment status after profile completion:', updatedProfile?.payment_status)

      // Call onComplete with payment status
      onComplete(updatedProfile?.payment_status === 'completed')
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
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === s ? 'bg-primary text-primary-foreground scale-110 shadow-lg' :
                    currentStep > s ? 'bg-green-500 text-white' : 'bg-muted text-foreground-muted'
                  }`}>
                  {currentStep > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-12 mx-1 rounded-full ${currentStep > s ? 'bg-green-500' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-foreground-muted">Tell us who you are and where you are in school</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 0712345678"
                    {...register('phone')}
                    className="bg-background/50"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  <p className="text-xs text-foreground-muted">Link your profile to school records</p>
                </div>

                <div className="space-y-3">
                  <Label>CBE Education Level</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'primary', label: 'Primary Education', sub: 'Grades 1-6' },
                      { value: 'secondary', label: 'Junior Secondary', sub: 'Grades 7-9' },
                      { value: 'tertiary', label: 'Senior Secondary / Tertiary', sub: 'Grades 10-12+' }
                    ].map((level) => (
                      <div
                        key={level.value}
                        onClick={() => setValue('schoolLevel', level.value as any)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${schoolLevel === level.value
                            ? 'border-primary bg-primary/5'
                            : 'border-card-border hover:border-primary/40'
                          }`}
                      >
                        <div>
                          <p className="font-semibold">{level.label}</p>
                          <p className="text-xs text-foreground-muted">{level.sub}</p>
                        </div>
                        {schoolLevel === level.value && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                    ))}
                  </div>
                  {errors.schoolLevel && <p className="text-sm text-destructive">{errors.schoolLevel.message}</p>}
                </div>

                {schoolLevel && (
                  <div className="space-y-2">
                    <Label htmlFor="currentGrade">Current Grade/Year</Label>
                    <Input
                      id="currentGrade"
                      placeholder="e.g., Grade 8"
                      {...register('currentGrade')}
                      className="bg-background/50"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Subjects & Interests */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Learning Areas</h3>
                        <p className="text-sm text-foreground-muted">What are you studying?</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={selectedSubjects.length >= 3 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {selectedSubjects.length}/3 Selected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {dynamicSubjects.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSubjectToggle(s.subject_name)}
                        className={`p-3 rounded-lg border text-center cursor-pointer transition-all text-sm font-medium ${selectedSubjects.includes(s.subject_name)
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-card-border hover:border-primary/50'
                          }`}
                      >
                        {s.subject_name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Target className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Career Interests</h3>
                        <p className="text-sm text-foreground-muted">Where do you want to go?</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={selectedInterests.length >= 2 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {selectedInterests.length}/2 Selected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dynamicInterests.map((interest) => (
                      <div
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.interest_name)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedInterests.includes(interest.interest_name)
                            ? 'bg-secondary/10 border-secondary text-secondary-foreground shadow-sm'
                            : 'bg-background border-card-border hover:border-secondary/50'
                          }`}
                      >
                        <span className="text-sm font-medium">{interest.interest_name}</span>
                        {selectedInterests.includes(interest.interest_name) && <CheckCircle className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Personality Discovery */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Career Discovery</h3>
                    <p className="text-sm text-foreground-muted">Select all the activities you enjoy doing</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {RIASEC_ACTIVITIES.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => {
                        setSelectedActivities(prev =>
                          prev.includes(activity.id) ? prev.filter(a => a !== activity.id) : [...prev, activity.id]
                        )
                      }}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-95 ${selectedActivities.includes(activity.id)
                          ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/50 shadow-sm'
                          : 'bg-background border-card-border hover:border-purple-300'
                        }`}
                    >
                      <span className="text-sm font-medium">{activity.text}</span>
                      {selectedActivities.includes(activity.id) ? (
                        <div className="bg-purple-500 text-white rounded-full p-1">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mt-8">
                  <Label htmlFor="careerGoals" className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" /> Career Aspirations (Optional)
                  </Label>
                  <Textarea
                    id="careerGoals"
                    placeholder="Tell us about your dreams..."
                    {...register('careerGoals')}
                    className="bg-background/50"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-card-border">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={isLoading}
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </Button>
              ) : (
                <div /> // Spacer
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  className="bg-gradient-primary text-primary-foreground min-w-[120px]"
                  onClick={() => {
                    if (currentStep === 1 && (!watch('schoolLevel') || !watch('phone'))) {
                      setError('Please complete the basic information');
                      return;
                    }
                    if (currentStep === 2 && (selectedSubjects.length < 3 || selectedInterests.length < 2)) {
                      setError('Please select the required subjects and interests');
                      return;
                    }
                    setError(null);
                    setCurrentStep(prev => prev + 1);
                  }}
                >
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Discover My Career</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
