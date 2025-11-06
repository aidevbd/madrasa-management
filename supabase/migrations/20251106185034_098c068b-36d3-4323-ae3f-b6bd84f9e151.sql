-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff')),
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('উপস্থিত', 'অনুপস্থিত', 'ছুটি', 'বিলম্বে')),
  remarks TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, user_type, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can manage attendance"
ON public.attendance FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Users can view own attendance"
ON public.attendance FOR SELECT
USING (
  auth.uid()::text = user_id::text OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get attendance statistics
CREATE OR REPLACE FUNCTION public.get_attendance_stats(
  p_user_id UUID,
  p_user_type TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_days BIGINT,
  present_days BIGINT,
  absent_days BIGINT,
  leave_days BIGINT,
  late_days BIGINT,
  attendance_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_days,
    COUNT(*) FILTER (WHERE status = 'উপস্থিত')::BIGINT as present_days,
    COUNT(*) FILTER (WHERE status = 'অনুপস্থিত')::BIGINT as absent_days,
    COUNT(*) FILTER (WHERE status = 'ছুটি')::BIGINT as leave_days,
    COUNT(*) FILTER (WHERE status = 'বিলম্বে')::BIGINT as late_days,
    ROUND(
      (COUNT(*) FILTER (WHERE status IN ('উপস্থিত', 'বিলম্বে'))::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100,
      2
    ) as attendance_percentage
  FROM public.attendance
  WHERE user_id = p_user_id
    AND user_type = p_user_type
    AND date BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Add audit trigger
CREATE TRIGGER attendance_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();