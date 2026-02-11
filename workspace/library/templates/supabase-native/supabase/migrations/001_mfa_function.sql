-- Migration: MFA Authentication Helper Function
-- This function checks if the current user has completed MFA verification
-- Use in RLS policies to require MFA for sensitive operations

-- Create a separate schema for authentication helpers
create schema if not exists "authenticative";

-- Grant usage on the schema
grant usage on schema authenticative to authenticated;
grant usage on schema authenticative to service_role;

-- Function to check if user has completed MFA verification
-- Returns true if:
-- 1. User has no MFA factors enrolled (aal1 is sufficient)
-- 2. User has MFA factors enrolled AND has completed aal2 verification
CREATE OR REPLACE FUNCTION authenticative.is_user_authenticated()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
AS $$
  SELECT array[(select auth.jwt()->>'aal')] <@ (
    SELECT
      CASE
        WHEN count(id) > 0 THEN array['aal2']
        ELSE array['aal1', 'aal2']
      END as aal
    FROM auth.mfa_factors
    WHERE (auth.uid() = user_id)
    AND status = 'verified'
  );
$$;

-- Grant execute permission
grant execute on function authenticative.is_user_authenticated() to authenticated;

-- Comment for documentation
comment on function authenticative.is_user_authenticated() is
'Returns true if the current user has satisfied MFA requirements.
If user has enrolled MFA factors, requires aal2. Otherwise, aal1 is sufficient.';
