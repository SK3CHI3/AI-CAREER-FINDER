import { supabase } from './supabase'

export const PRICE_PER_STUDENT_PER_TERM = 10

export const SUBSCRIPTION_PLAN = {
  name: 'Institutional Plan',
  description: 'Full access for all teachers and students',
  features: [
    'Unlimited Teacher Accounts',
    'Unlimited Classes',
    'Institutional Analytics',
    'Priority Support',
    'Custom AI Guidance Roster'
  ]
}

export interface School {
  id: string
  name: string
  code: string
  region: string | null
  subscription_tier: string | null
  status: string | null
  updated_at: string
  settings?: any
}

export interface SchoolMember {
  id: string
  school_id: string
  user_id: string
  role: 'school_admin' | 'teacher'
  invited_by: string | null
  joined_at: string
}

export interface TeacherInvite {
  id: string
  school_id: string
  email: string
  token: string
  invited_by: string
  created_at: string
  expires_at: string
  accepted_at: string | null
}

export interface TeacherProfile {
  user_id: string
  full_name: string | null
  email: string
  school_role: 'school_admin' | 'teacher'
  joined_at: string
}

export interface SchoolSubscription {
  id: string
  school_id: string
  tier: string
  started_at: string
  expires_at: string | null
  payment_reference: string | null
}

class SchoolService {
  // ─── School CRUD ──────────────────────────────────────────────────────

  async createSchool(
    userId: string,
    name: string,
    code: string,
    region: string
  ): Promise<School> {
    // 1. Insert school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({ name, code: code.toUpperCase().trim(), region, status: 'active' })
      .select()
      .single()

    if (schoolError) throw new Error(schoolError.message)

    // 2. Add creator as school_admin in school_members
    const { error: memberError } = await supabase
      .from('school_members')
      .insert({
        school_id: school.id,
        user_id: userId,
        role: 'school_admin',
        invited_by: userId,
      })

    if (memberError) throw new Error(memberError.message)

    // 3. Update profile with school_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ school_id: school.id })
      .eq('id', userId)

    if (profileError) throw new Error(profileError.message)

    return school
  }

  async getMySchool(userId: string): Promise<School | null> {
    // Find the school this user is an admin or teacher of
    const { data: membership, error: memberError } = await supabase
      .from('school_members')
      .select('school_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    if (memberError || !membership) return null

    const { data: school, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', membership.school_id)
      .single()

    if (error) return null
    return school
  }

  async getSchoolById(schoolId: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single()

    if (error) return null
    return data
  }

  async updateSchool(schoolId: string, updates: any): Promise<School> {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', schoolId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // ─── Members ─────────────────────────────────────────────────────────

  async getSchoolTeachers(schoolId: string): Promise<TeacherProfile[]> {
    const { data, error } = await supabase
      .from('school_members')
      .select(`
        user_id,
        role,
        joined_at,
        profiles ( full_name, email )
      `)
      .eq('school_id', schoolId)

    if (error) throw new Error(error.message)

    return (data || []).map((m: any) => ({
      user_id: m.user_id,
      full_name: m.profiles?.full_name ?? null,
      email: m.profiles?.email ?? '',
      school_role: m.role,
      joined_at: m.joined_at,
    }))
  }

  async removeTeacher(schoolId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('school_members')
      .delete()
      .eq('school_id', schoolId)
      .eq('user_id', userId)
      .neq('role', 'school_admin') // Never remove school_admin this way

    if (error) throw new Error(error.message)
  }

  // ─── Students ─────────────────────────────────────────────────────────

  async getSchoolStudents(schoolId: string): Promise<any[]> {
    // A school's students are anyone enrolled in classes belonging to this school
    const { data: schoolClasses } = await supabase
      .from('classes')
      .select('id')
      .eq('school_id', schoolId)
      
    if (!schoolClasses || schoolClasses.length === 0) return []
    
    const classIds = schoolClasses.map(c => c.id)
    
    // Fetch unique enrollments. Since a student can be in multiple classes, we might want to group them.
    const { data: enrollments, error } = await supabase
      .from('class_enrollments')
      .select(`
        id,
        student_user_id,
        student_upi,
        enrolled_at,
        class_id,
        classes ( name, grade_level ),
        profiles!student_user_id ( full_name, email )
      `)
      .in('class_id', classIds)
      .order('enrolled_at', { ascending: false })

    if (error) throw new Error(error.message)
    
    // Deduplicate by UPI
    const studentMap = new Map<string, any>()
    const enrollmentsList = enrollments as any[] || []
    
    enrollmentsList.forEach(e => {
        const upi = e.student_upi?.toUpperCase() || `UNKNOWN-${e.id}`;
        if (!studentMap.has(upi)) {
            studentMap.set(upi, {
                user_id: e.student_user_id,
                upi_number: e.student_upi,
                full_name: e.profiles?.full_name || 'Pending Registration...',
                email: e.profiles?.email || 'N/A',
                classes: [{ name: e.classes?.name, grade: e.classes?.grade_level }],
                enrolled_at: e.enrolled_at
            })
        } else {
            const existing = studentMap.get(upi)
            existing.classes.push({ name: e.classes?.name, grade: e.classes?.grade_level })
        }
    })
    
    return Array.from(studentMap.values())
  }

  // ─── School Stats ─────────────────────────────────────────────────────

  async getSchoolStats(schoolId: string): Promise<{
    teacherCount: number
    classCount: number
    studentCount: number
  }> {
    const [membersRes, classesRes] = await Promise.allSettled([
      supabase
        .from('school_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('role', 'teacher'),
      supabase
        .from('classes')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId),
    ])

    const teacherCount =
      membersRes.status === 'fulfilled' ? (membersRes.value.count ?? 0) : 0
    const classCount =
      classesRes.status === 'fulfilled' ? (classesRes.value.count ?? 0) : 0

    // Student count via class_enrollments joined to school classes
    const { data: schoolClassIds } = await supabase
      .from('classes')
      .select('id')
      .eq('school_id', schoolId)

    let studentCount = 0
    if (schoolClassIds && schoolClassIds.length > 0) {
      const ids = schoolClassIds.map((c) => c.id)
      const { count } = await supabase
        .from('class_enrollments')
        .select('student_user_id', { count: 'exact', head: true })
        .in('class_id', ids)
      studentCount = count ?? 0
    }

    return { teacherCount, classCount, studentCount }
  }

  // ─── Teacher Invites ─────────────────────────────────────────────────

  async inviteTeacher(
    schoolId: string,
    email: string,
    invitedBy: string
  ): Promise<TeacherInvite> {
    // Generate a random token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const { data, error } = await (supabase
      .from('teacher_invites' as any) as any)
      .upsert(
        {
          school_id: schoolId,
          email: email.toLowerCase().trim(),
          token,
          invited_by: invitedBy,
          expires_at: expiresAt,
          accepted_at: null,
        },
        { onConflict: 'school_id,email' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async getInviteByToken(token: string): Promise<TeacherInvite | null> {
    const { data, error } = await (supabase
      .from('teacher_invites' as any) as any)
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (error || !data) return null
    return data
  }

  async acceptInvite(token: string, userId: string): Promise<void> {
    // Rely entirely on the backend RPC to validate and apply the invite atomically.
    // This avoids RLS edge cases and silent failures that occur when the front-end JWT is fresh.
    const { error } = await supabase.rpc('accept_teacher_invite' as any, { p_token: token })
    if (error) throw new Error(error.message)
  }

  async getPendingInvites(schoolId: string): Promise<TeacherInvite[]> {
    const { data, error } = await (supabase
      .from('teacher_invites' as any) as any)
      .select('*')
      .eq('school_id', schoolId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  // ─── Subscription ─────────────────────────────────────────────────────

  async getSubscription(schoolId: string): Promise<SchoolSubscription | null> {
    const { data, error } = await supabase
      .from('school_subscriptions')
      .select('*')
      .eq('school_id', schoolId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return null
    return data
  }

  async hasActiveSubscription(schoolId: string): Promise<boolean> {
    const sub = await this.getSubscription(schoolId)
    if (!sub) return false

    // Check if tier is not null and not expired
    if (!sub.tier || sub.tier === 'FREE') return false

    if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
      return false
    }

    return true
  }
}

export const schoolService = new SchoolService()
