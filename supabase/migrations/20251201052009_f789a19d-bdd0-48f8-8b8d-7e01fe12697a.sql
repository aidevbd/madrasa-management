-- Exams table for exam management
CREATE TABLE public.exams (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_name TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'সাময়িক',
    department TEXT NOT NULL,
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    total_marks NUMERIC NOT NULL DEFAULT 100,
    pass_marks NUMERIC NOT NULL DEFAULT 40,
    exam_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    academic_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exam results table
CREATE TABLE public.exam_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC NOT NULL,
    grade TEXT,
    remarks TEXT,
    is_absent BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(exam_id, student_id)
);

-- Timetable/Class schedule table
CREATE TABLE public.timetables (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    department TEXT NOT NULL,
    class_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id UUID REFERENCES public.staff(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams
CREATE POLICY "Admins and teachers can manage exams" 
ON public.exams FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Authenticated users can view exams" 
ON public.exams FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for exam_results
CREATE POLICY "Admins and teachers can manage results" 
ON public.exam_results FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can view own results" 
ON public.exam_results FOR SELECT 
USING (
    student_id IN (
        SELECT id FROM students WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
    ) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher')
);

-- RLS Policies for timetables
CREATE POLICY "Admins and teachers can manage timetables" 
ON public.timetables FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Authenticated users can view timetables" 
ON public.timetables FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Update triggers
CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at
BEFORE UPDATE ON public.exam_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetables_updated_at
BEFORE UPDATE ON public.timetables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();