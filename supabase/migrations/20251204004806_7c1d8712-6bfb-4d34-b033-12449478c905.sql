-- Hostel Rooms Table
CREATE TABLE public.hostel_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  room_type TEXT NOT NULL DEFAULT 'সাধারণ',
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hostel Allocations Table
CREATE TABLE public.hostel_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.hostel_rooms(id) ON DELETE CASCADE,
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  monthly_fee NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'সক্রিয়',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, status)
);

-- Homework/Assignments Table
CREATE TABLE public.homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.staff(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  attachment_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hostel_rooms
CREATE POLICY "Admins can manage hostel rooms" ON public.hostel_rooms
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view hostel rooms" ON public.hostel_rooms
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for hostel_allocations
CREATE POLICY "Admins can manage allocations" ON public.hostel_allocations
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view own allocation" ON public.hostel_allocations
FOR SELECT USING (
  student_id IN (
    SELECT id FROM students WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for homework
CREATE POLICY "Admins and teachers can manage homework" ON public.homework
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Authenticated users can view homework" ON public.homework
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_hostel_rooms_updated_at
  BEFORE UPDATE ON public.hostel_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostel_allocations_updated_at
  BEFORE UPDATE ON public.hostel_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_homework_updated_at
  BEFORE UPDATE ON public.homework
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();