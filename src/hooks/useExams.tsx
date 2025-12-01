import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Exam {
  id: string;
  exam_name: string;
  exam_type: string;
  department: string;
  class_name: string;
  subject: string;
  total_marks: number;
  pass_marks: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  academic_year: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade?: string;
  remarks?: string;
  is_absent: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  exam?: Exam;
  student?: {
    id: string;
    name: string;
    student_id: string;
    class_name: string;
    department: string;
  };
}

// Fetch all exams
export const useExams = (filters?: { department?: string; class_name?: string; academic_year?: number }) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: async () => {
      let query = supabase
        .from('exams')
        .select('*')
        .order('exam_date', { ascending: false });
      
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.class_name) {
        query = query.eq('class_name', filters.class_name);
      }
      if (filters?.academic_year) {
        query = query.eq('academic_year', filters.academic_year);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Exam[];
    },
  });
};

// Fetch exam results
export const useExamResults = (examId?: string, studentId?: string) => {
  return useQuery({
    queryKey: ['exam-results', examId, studentId],
    queryFn: async () => {
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams(*),
          student:students(id, name, student_id, class_name, department)
        `);
      
      if (examId) {
        query = query.eq('exam_id', examId);
      }
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ExamResult[];
    },
    enabled: !!(examId || studentId),
  });
};

// Create exam
export const useCreateExam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('exams')
        .insert(exam)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা সফলভাবে যোগ করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`পরীক্ষা যোগ করতে সমস্যা: ${error.message}`);
    },
  });
};

// Update exam
export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...exam }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(exam)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা আপডেট করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`পরীক্ষা আপডেট করতে সমস্যা: ${error.message}`);
    },
  });
};

// Delete exam
export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('পরীক্ষা মুছে ফেলা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`পরীক্ষা মুছতে সমস্যা: ${error.message}`);
    },
  });
};

// Add exam result
export const useAddExamResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (result: Omit<ExamResult, 'id' | 'created_at' | 'updated_at' | 'exam' | 'student'>) => {
      // Calculate grade based on marks
      const grade = calculateGrade(result.marks_obtained, 100); // Assuming 100 total marks
      
      const { data, error } = await supabase
        .from('exam_results')
        .upsert({ ...result, grade }, { onConflict: 'exam_id,student_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast.success('ফলাফল সংরক্ষণ করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`ফলাফল সংরক্ষণ করতে সমস্যা: ${error.message}`);
    },
  });
};

// Bulk add exam results
export const useBulkAddExamResults = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (results: Omit<ExamResult, 'id' | 'created_at' | 'updated_at' | 'exam' | 'student'>[]) => {
      const resultsWithGrades = results.map(r => ({
        ...r,
        grade: r.is_absent ? 'F' : calculateGrade(r.marks_obtained, 100),
      }));
      
      const { data, error } = await supabase
        .from('exam_results')
        .upsert(resultsWithGrades, { onConflict: 'exam_id,student_id' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
      toast.success('সকল ফলাফল সংরক্ষণ করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`ফলাফল সংরক্ষণ করতে সমস্যা: ${error.message}`);
    },
  });
};

// Calculate grade helper
export const calculateGrade = (marks: number, totalMarks: number): string => {
  const percentage = (marks / totalMarks) * 100;
  
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'A-';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

// Get student report card data
export const useStudentReportCard = (studentId: string, academicYear?: number) => {
  return useQuery({
    queryKey: ['student-report-card', studentId, academicYear],
    queryFn: async () => {
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exams(*)
        `)
        .eq('student_id', studentId);
      
      if (academicYear) {
        query = query.eq('exam.academic_year', academicYear);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
};
