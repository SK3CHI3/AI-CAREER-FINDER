import { supabase } from './supabase'

export interface ClassRecord {
    id: string
    school_id: string
    name: string
    grade_level: string | null
    academic_year: string | null
    teacher_id: string | null
    created_at: string
}

export interface ClassEnrollment {
    id: string
    class_id: string
    student_user_id: string
    enrolled_at: string
    source: 'manual' | 'spreadsheet'
}

export interface StudentInClass {
    id: string
    user_id: string | null
    full_name: string | null
    email: string | null
    phone: string | null
    enrolled_at: string
    source: 'manual' | 'spreadsheet'
}

class ClassService {
    // ─── Class CRUD ───────────────────────────────────────────────────────

    async createClass(
        schoolId: string,
        teacherId: string,
        name: string,
        gradeLevel: string,
        academicYear: string
    ): Promise<ClassRecord> {
        const { data, error } = await supabase
            .from('classes')
            .insert({
                school_id: schoolId,
                teacher_id: teacherId,
                name,
                grade_level: gradeLevel,
                academic_year: academicYear,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getTeacherClasses(teacherId: string): Promise<ClassRecord[]> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    async getSchoolClasses(schoolId: string): Promise<ClassRecord[]> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    async getClassById(classId: string): Promise<ClassRecord | null> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single()

        if (error) return null
        return data
    }

    async updateClass(
        classId: string,
        updates: Partial<Pick<ClassRecord, 'name' | 'grade_level' | 'academic_year' | 'teacher_id'>>
    ): Promise<ClassRecord> {
        const { data, error } = await supabase
            .from('classes')
            .update(updates)
            .eq('id', classId)
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async deleteClass(classId: string): Promise<void> {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', classId)

        if (error) throw new Error(error.message)
    }

    // ─── Enrollment ────────────────────────────────────────────────────────

    async getClassStudents(classId: string): Promise<StudentInClass[]> {
        const { data, error } = await supabase
            .from('class_enrollments')
            .select(`
        id,
        student_user_id,
        student_phone,
        enrolled_at,
        source,
        profiles:student_user_id ( full_name, email, phone )
      `)
            .eq('class_id', classId)
            .order('enrolled_at', { ascending: false })

        if (error) throw new Error(error.message)

        return (data || []).map((e: any) => ({
            id: e.id,
            user_id: e.student_user_id,
            full_name: e.profiles?.full_name ?? null,
            email: e.profiles?.email ?? null,
            phone: e.student_phone || e.profiles?.phone || null,
            enrolled_at: e.enrolled_at,
            source: e.source,
        }))
    }

    async addStudentByPhone(classId: string, phone: string): Promise<StudentInClass> {
        const cleanPhone = phone.trim()

        // 1. Try to find student by phone first
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .eq('phone', cleanPhone)
            .maybeSingle()

        // 2. Enroll using either profile id or just the phone
        const insertData: any = { class_id: classId, student_phone: cleanPhone, source: 'manual' }
        if (profile?.id) {
            insertData.student_user_id = profile.id
        }

        const { data, error: enrollError } = await supabase
            .from('class_enrollments')
            .insert(insertData)
            .select('id, student_user_id, student_phone, enrolled_at, source')
            .single()

        if (enrollError) {
            // Handle unique constraint manually for upsert-like behavior if they exist
            if (enrollError.code === '23505') {
                throw new Error('Student is already enrolled in this class.')
            }
            throw new Error(enrollError.message)
        }

        return {
            id: data.id,
            user_id: profile?.id || null,
            full_name: profile?.full_name || null,
            email: profile?.email || null,
            phone: cleanPhone,
            enrolled_at: data.enrolled_at,
            source: 'manual',
        }
    }

    async removeStudent(enrollmentId: string): Promise<void> {
        const { error } = await supabase
            .from('class_enrollments')
            .delete()
            .eq('id', enrollmentId)

        if (error) throw new Error(error.message)
    }

    // ─── Grade Access for a Class ──────────────────────────────────────────

    async getClassGrades(classId: string): Promise<any[]> {
        // Get all enrolled students first
        const { data: enrollments, error: enrollError } = await supabase
            .from('class_enrollments')
            .select('student_user_id, student_phone')
            .eq('class_id', classId)

        if (enrollError || !enrollments?.length) return []

        const studentIds = enrollments.map((e) => e.student_user_id).filter(Boolean)
        const studentPhones = enrollments.map((e) => e.student_phone).filter(Boolean)

        let query = supabase
            .from('student_grades')
            .select(`
        *,
        profiles:user_id ( full_name, email, phone )
      `)

        // Need to construct our query carefully to allow OR conditions over nested IN
        if (studentIds.length > 0 && studentPhones.length > 0) {
            query = query.or(`user_id.in.(${studentIds.join(',')}),student_phone.in.(${studentPhones.join(',')})`)
        } else if (studentIds.length > 0) {
            query = query.in('user_id', studentIds)
        } else if (studentPhones.length > 0) {
            query = query.in('student_phone', studentPhones)
        } else {
            return []
        }

        const { data, error } = await query
            .order('academic_year', { ascending: false })
            .order('term', { ascending: false })

        if (error) throw new Error(error.message)
        return data || []
    }

    // ─── Counts ─────────────────────────────────────────────────────────────

    async getClassStudentCount(classId: string): Promise<number> {
        const { count, error } = await supabase
            .from('class_enrollments')
            .select('student_user_id', { count: 'exact', head: true })
            .eq('class_id', classId)

        if (error) return 0
        return count ?? 0
    }
}

export const classService = new ClassService()
