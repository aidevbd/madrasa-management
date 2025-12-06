-- 1. Create trigger function to auto-set created_by from auth.uid()
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create triggers for all tables with created_by column
CREATE TRIGGER set_students_created_by
  BEFORE INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_staff_created_by
  BEFORE INSERT ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_attendance_created_by
  BEFORE INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_expenses_created_by
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_fee_payments_created_by
  BEFORE INSERT ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_salary_payments_created_by
  BEFORE INSERT ON public.salary_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_notices_created_by
  BEFORE INSERT ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_transactions_created_by
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_exams_created_by
  BEFORE INSERT ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_exam_results_created_by
  BEFORE INSERT ON public.exam_results
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_timetables_created_by
  BEFORE INSERT ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_fee_structures_created_by
  BEFORE INSERT ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_events_created_by
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_homework_created_by
  BEFORE INSERT ON public.homework
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_hostel_rooms_created_by
  BEFORE INSERT ON public.hostel_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_hostel_allocations_created_by
  BEFORE INSERT ON public.hostel_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

-- 3. Create function to set uploaded_by for documents
CREATE OR REPLACE FUNCTION public.set_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.uploaded_by IS NULL THEN
    NEW.uploaded_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_documents_uploaded_by
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_uploaded_by();

-- 4. Make student-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'student-photos';

-- 5. Make staff-photos bucket private  
UPDATE storage.buckets SET public = false WHERE id = 'staff-photos';

-- 6. Drop old public viewing policies for photos
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view staff photos" ON storage.objects;

-- 7. Create new authenticated-only viewing policies for photos
CREATE POLICY "Authenticated users can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view staff photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff-photos' AND auth.role() = 'authenticated');

-- 8. Strengthen fee_payments RLS - Remove phone-based matching, use proper user relationships
DROP POLICY IF EXISTS "Students can view their own fee payments" ON public.fee_payments;

-- 9. Add teacher class restriction for attendance
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;

CREATE POLICY "Teachers can manage attendance for their assigned classes"
ON public.attendance
FOR ALL
USING (
  has_role(auth.uid(), 'teacher') AND (
    -- Teachers can only manage attendance for students in classes they teach
    EXISTS (
      SELECT 1 FROM public.timetables t
      JOIN public.students s ON s.class_name = t.class_name AND s.department::text = t.department
      WHERE t.teacher_id IN (SELECT id FROM public.staff WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND attendance.user_id = s.id
      AND attendance.user_type = 'student'
    )
    OR attendance.user_type = 'staff'
  )
)
WITH CHECK (
  has_role(auth.uid(), 'teacher') AND (
    EXISTS (
      SELECT 1 FROM public.timetables t
      JOIN public.students s ON s.class_name = t.class_name AND s.department::text = t.department
      WHERE t.teacher_id IN (SELECT id FROM public.staff WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND attendance.user_id = s.id
      AND attendance.user_type = 'student'
    )
    OR attendance.user_type = 'staff'
  )
);