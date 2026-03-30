-- Add student_name column to class_enrollments to display names for unauthenticated students
ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS student_name TEXT;
