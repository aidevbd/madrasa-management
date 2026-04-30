
-- Add 'parent' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'parent';

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Staff can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'teacher'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Parent-Student link table
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship TEXT DEFAULT 'guardian',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, student_id)
);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own links"
ON public.parent_students FOR SELECT
USING (auth.uid() = parent_user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage parent links"
ON public.parent_students FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Helper function: check if user is parent of student
CREATE OR REPLACE FUNCTION public.is_parent_of_student(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.parent_students
    WHERE parent_user_id = _user_id AND student_id = _student_id
  )
$$;

-- Extend RLS so parents can view their children's data
CREATE POLICY "Parents view linked students"
ON public.students FOR SELECT
USING (public.is_parent_of_student(auth.uid(), id));

CREATE POLICY "Parents view linked attendance"
ON public.attendance FOR SELECT
USING (user_type = 'student' AND public.is_parent_of_student(auth.uid(), user_id));

CREATE POLICY "Parents view linked fee payments"
ON public.fee_payments FOR SELECT
USING (public.is_parent_of_student(auth.uid(), student_id));

CREATE POLICY "Parents view linked exam results"
ON public.exam_results FOR SELECT
USING (public.is_parent_of_student(auth.uid(), student_id));

CREATE POLICY "Parents view linked hostel"
ON public.hostel_allocations FOR SELECT
USING (public.is_parent_of_student(auth.uid(), student_id));

-- Trigger: when a notice is created, notify all admins/teachers
CREATE OR REPLACE FUNCTION public.notify_on_new_notice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT ur.user_id, 'নতুন নোটিশ', NEW.title, 'notice', '/notices'
  FROM public.user_roles ur
  WHERE ur.role IN ('admin', 'teacher', 'accountant')
    AND ur.user_id != COALESCE(NEW.created_by, '00000000-0000-0000-0000-000000000000'::uuid);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_notice ON public.notices;
CREATE TRIGGER trg_notify_new_notice
AFTER INSERT ON public.notices
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_notice();

-- Trigger: when fee payment recorded, notify the student's parents
CREATE OR REPLACE FUNCTION public.notify_on_fee_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_name TEXT;
BEGIN
  SELECT name INTO student_name FROM public.students WHERE id = NEW.student_id;
  
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT ps.parent_user_id,
         'ফি পেমেন্ট নিশ্চিত',
         student_name || ' এর ফি পরিশোধ হয়েছে: ৳' || NEW.amount,
         'payment',
         '/parent-portal'
  FROM public.parent_students ps
  WHERE ps.student_id = NEW.student_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_fee_payment ON public.fee_payments;
CREATE TRIGGER trg_notify_fee_payment
AFTER INSERT ON public.fee_payments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_fee_payment();
