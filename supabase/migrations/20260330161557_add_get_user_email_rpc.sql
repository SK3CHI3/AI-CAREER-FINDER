-- Create RPC function to look up email by UPI or phone number
-- This bypasses RLS so that anon users can find their generated email to log in
CREATE OR REPLACE FUNCTION get_user_email(p_identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- First try UPI
  SELECT email INTO v_email
  FROM profiles
  WHERE upi_number = upper(p_identifier)
  LIMIT 1;

  IF v_email IS NOT NULL THEN
    RETURN v_email;
  END IF;

  -- Then try Phone
  SELECT email INTO v_email
  FROM profiles
  WHERE phone = p_identifier
  LIMIT 1;

  RETURN v_email;
END;
$$;
