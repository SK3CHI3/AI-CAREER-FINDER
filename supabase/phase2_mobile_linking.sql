-- Phase 2: Mobile Number Linking Schema Updates

-- 1. Add phone number to profiles
ALTER TABLE public.profiles ADD COLUMN phone text UNIQUE;

-- 2. Allow enrollments without a user_id by using a mobile number instead
-- Make student_user_id nullable (already is, but let's be explicit)
ALTER TABLE public.class_enrollments ALTER COLUMN student_user_id DROP NOT NULL;
ALTER TABLE public.class_enrollments ADD COLUMN student_phone text;

-- Add check constraint: an enrollment must have either a user_id or a phone number
ALTER TABLE public.class_enrollments ADD CONSTRAINT class_enrollments_student_identifier_check 
CHECK (student_user_id IS NOT NULL OR student_phone IS NOT NULL);

-- 3. Allow grades to be recorded against a phone number if the user hasn't registered yet
-- Make user_id nullable
ALTER TABLE public.student_grades ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.student_grades ADD COLUMN student_phone text;

-- Add check constraint: a grade must belong to either a user_id or a phone number
ALTER TABLE public.student_grades ADD CONSTRAINT student_grades_student_identifier_check 
CHECK (user_id IS NOT NULL OR student_phone IS NOT NULL);


-- 4. Create an automatic linking trigger
-- When a profile is created or updated with a phone number, automatically link existing enrollments and grades
CREATE OR REPLACE FUNCTION public.link_student_records_by_phone()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the phone number was just set or changed
    IF NEW.phone IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.phone IS DISTINCT FROM NEW.phone) THEN
        
        -- Link Class Enrollments
        UPDATE public.class_enrollments
        SET student_user_id = NEW.id
        WHERE student_phone = NEW.phone 
          AND student_user_id IS NULL;

        -- Link Student Grades
        UPDATE public.student_grades
        SET user_id = NEW.id
        WHERE student_phone = NEW.phone 
          AND user_id IS NULL;
          
        -- Link to school if they have an enrollment but no school_id
        IF NEW.school_id IS NULL THEN
            -- Find the first school_id from their newly linked class enrollments
            UPDATE public.profiles
            SET school_id = (
                SELECT c.school_id 
                FROM public.class_enrollments ce
                JOIN public.classes c ON c.id = ce.class_id
                WHERE ce.student_user_id = NEW.id
                LIMIT 1
            )
            WHERE id = NEW.id;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS trigger_link_student_records ON public.profiles;
CREATE TRIGGER trigger_link_student_records
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.link_student_records_by_phone();
