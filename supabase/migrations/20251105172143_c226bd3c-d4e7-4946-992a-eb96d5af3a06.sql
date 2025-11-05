-- Add restrictive INSERT policy to prevent direct audit log manipulation
-- Only the SECURITY DEFINER trigger function can insert into audit_log
CREATE POLICY "Prevent direct audit log inserts"
ON public.audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (false);

-- Verify audit_trigger_function has SECURITY DEFINER (it already does, but this is for documentation)
-- The existing audit_trigger_function uses SECURITY DEFINER which allows it to bypass RLS
-- and insert audit records even with the restrictive policy above