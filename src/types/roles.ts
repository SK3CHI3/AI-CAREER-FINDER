/**
 * User roles for school-integrated pivot.
 * No parent role – parents share the student dashboard.
 */
export type UserRole = 'student' | 'admin' | 'school' | 'teacher'

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  student: '/student',
  admin: '/admin',
  school: '/school',
  teacher: '/teacher',
}

export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role] ?? '/student'
}
