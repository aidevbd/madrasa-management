-- Create Storage Buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']::text[]),
  ('student-photos', 'student-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[]),
  ('staff-photos', 'staff-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for Documents Bucket (Private)
DROP POLICY IF EXISTS "Admins and teachers can upload documents" ON storage.objects;
CREATE POLICY "Admins and teachers can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'))
);

DROP POLICY IF EXISTS "Admins and teachers can view documents" ON storage.objects;
CREATE POLICY "Admins and teachers can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'))
);

DROP POLICY IF EXISTS "Admins and teachers can update documents" ON storage.objects;
CREATE POLICY "Admins and teachers can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'))
);

DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Storage RLS Policies for Student Photos (Public Read)
DROP POLICY IF EXISTS "Anyone can view student photos" ON storage.objects;
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-photos');

DROP POLICY IF EXISTS "Admins can upload student photos" ON storage.objects;
CREATE POLICY "Admins can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-photos' 
  AND has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update student photos" ON storage.objects;
CREATE POLICY "Admins can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-photos' 
  AND has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can delete student photos" ON storage.objects;
CREATE POLICY "Admins can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-photos' 
  AND has_role(auth.uid(), 'admin')
);

-- Storage RLS Policies for Staff Photos (Public Read)
DROP POLICY IF EXISTS "Anyone can view staff photos" ON storage.objects;
CREATE POLICY "Anyone can view staff photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'staff-photos');

DROP POLICY IF EXISTS "Admins can upload staff photos" ON storage.objects;
CREATE POLICY "Admins can upload staff photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'staff-photos' 
  AND has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can update staff photos" ON storage.objects;
CREATE POLICY "Admins can update staff photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'staff-photos' 
  AND has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Admins can delete staff photos" ON storage.objects;
CREATE POLICY "Admins can delete staff photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'staff-photos' 
  AND has_role(auth.uid(), 'admin')
);

-- Add Audit Log Triggers (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_students'
  ) THEN
    CREATE TRIGGER audit_students
      AFTER INSERT OR UPDATE OR DELETE ON public.students
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_staff'
  ) THEN
    CREATE TRIGGER audit_staff
      AFTER INSERT OR UPDATE OR DELETE ON public.staff
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_transactions'
  ) THEN
    CREATE TRIGGER audit_transactions
      AFTER INSERT OR UPDATE OR DELETE ON public.transactions
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_expenses'
  ) THEN
    CREATE TRIGGER audit_expenses
      AFTER INSERT OR UPDATE OR DELETE ON public.expenses
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_notices'
  ) THEN
    CREATE TRIGGER audit_notices
      AFTER INSERT OR UPDATE OR DELETE ON public.notices
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_documents'
  ) THEN
    CREATE TRIGGER audit_documents
      AFTER INSERT OR UPDATE OR DELETE ON public.documents
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
  END IF;
END $$;