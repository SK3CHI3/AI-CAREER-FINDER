-- Phase 1: teacher_invites table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.teacher_invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email       text NOT NULL,
  token       uuid NOT NULL DEFAULT gen_random_uuid(),
  invited_by  uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,

  UNIQUE (school_id, email)
);

-- RLS
ALTER TABLE public.teacher_invites ENABLE ROW LEVEL SECURITY;

-- School admins can view and insert invites for their school
CREATE POLICY "School admins manage invites"
  ON public.teacher_invites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.school_members sm
      WHERE sm.school_id = teacher_invites.school_id
        AND sm.user_id = auth.uid()
        AND sm.role = 'school_admin'
    )
  );

-- Anyone can read an invite by token (for the accept page)
CREATE POLICY "Anyone can read invite by token"
  ON public.teacher_invites
  FOR SELECT
  USING (true);
