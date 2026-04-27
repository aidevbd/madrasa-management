
-- Add user_id linking columns
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);

-- Drop insecure phone/name based policies
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own salary payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Students can view own fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Students can view own results" ON public.exam_results;
DROP POLICY IF EXISTS "Students can view own allocation" ON public.hostel_allocations;
DROP POLICY IF EXISTS "Teachers can manage attendance for their assigned classes" ON public.attendance;

-- Recreate using direct user_id link
CREATE POLICY "Staff can view own record"
ON public.staff FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Staff can view own salary payments"
ON public.salary_payments FOR SELECT
USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accountant')
);

CREATE POLICY "Students can view own fee payments"
ON public.fee_payments FOR SELECT
USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accountant')
);

CREATE POLICY "Students can view own results"
ON public.exam_results FOR SELECT
USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
);

CREATE POLICY "Students can view own allocation"
ON public.hostel_allocations FOR SELECT
USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Restrict teacher attendance management to their class students only (no staff)
CREATE POLICY "Teachers can manage attendance for their assigned classes"
ON public.attendance FOR ALL
USING (
  public.has_role(auth.uid(), 'teacher')
  AND user_type = 'student'
  AND EXISTS (
    SELECT 1
    FROM public.timetables t
    JOIN public.students s
      ON s.class_name = t.class_name AND s.department::text = t.department
    WHERE t.teacher_id IN (
      SELECT id FROM public.staff WHERE user_id = auth.uid()
    )
    AND attendance.user_id = s.id
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'teacher')
  AND user_type = 'student'
  AND EXISTS (
    SELECT 1
    FROM public.timetables t
    JOIN public.students s
      ON s.class_name = t.class_name AND s.department::text = t.department
    WHERE t.teacher_id IN (
      SELECT id FROM public.staff WHERE user_id = auth.uid()
    )
    AND attendance.user_id = s.id
  )
);
