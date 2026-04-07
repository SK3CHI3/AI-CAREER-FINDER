import { supabase } from './supabase'

export interface FieldDayRequest {
  id: string
  student_id: string
  school_id: string | null
  full_name: string
  contact_number: string
  preferred_location: string | null
  preferred_date: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

class FieldDayService {
  async submitRequest(data: {
    student_id: string
    school_id?: string | null
    full_name: string
    contact_number: string
    preferred_location?: string
    preferred_date?: string
  }): Promise<FieldDayRequest> {
    const { data: request, error } = await supabase
      .from('field_day_requests')
      .insert({
        student_id: data.student_id,
        school_id: data.school_id,
        full_name: data.full_name,
        contact_number: data.contact_number,
        preferred_location: data.preferred_location,
        preferred_date: data.preferred_date,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return request as FieldDayRequest
  }

  async getMyRequests(userId: string): Promise<FieldDayRequest[]> {
    const { data, error } = await supabase
      .from('field_day_requests')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as FieldDayRequest[]
  }

  async getAllRequests(): Promise<FieldDayRequest[]> {
    const { data, error } = await supabase
      .from('field_day_requests')
      .select('*, profiles ( full_name, email ), schools ( name )')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as any[]
  }

  async updateRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('field_day_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (error) throw new Error(error.message)
  }
}

export const fieldDayService = new FieldDayService()
