import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Timetable {
  id: string;
  department: string;
  class_name: string;
  day_of_week: string;
  subject: string;
  teacher_id?: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    name: string;
    designation: string;
  };
}

export const DAYS_OF_WEEK = [
  'শনিবার',
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
];

export const SUBJECTS = [
  'কুরআন',
  'হাদিস',
  'ফিকাহ',
  'আরবি',
  'বাংলা',
  'গণিত',
  'ইংরেজি',
  'বিজ্ঞান',
  'সামাজিক বিজ্ঞান',
  'ইসলামী ইতিহাস',
  'তাজবীদ',
  'নাহু',
  'সরফ',
];

// Fetch timetable
export const useTimetable = (filters?: { department?: string; class_name?: string; day_of_week?: string }) => {
  return useQuery({
    queryKey: ['timetable', filters],
    queryFn: async () => {
      let query = supabase
        .from('timetables')
        .select(`
          *,
          teacher:staff(id, name, designation)
        `)
        .eq('is_active', true)
        .order('start_time', { ascending: true });
      
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.class_name) {
        query = query.eq('class_name', filters.class_name);
      }
      if (filters?.day_of_week) {
        query = query.eq('day_of_week', filters.day_of_week);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Timetable[];
    },
  });
};

// Create timetable entry
export const useCreateTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: Omit<Timetable, 'id' | 'created_at' | 'updated_at' | 'teacher'>) => {
      const { data, error } = await supabase
        .from('timetables')
        .insert(entry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('ক্লাস শিডিউল যোগ করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`শিডিউল যোগ করতে সমস্যা: ${error.message}`);
    },
  });
};

// Update timetable entry
export const useUpdateTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...entry }: Partial<Timetable> & { id: string }) => {
      const { data, error } = await supabase
        .from('timetables')
        .update(entry)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('শিডিউল আপডেট করা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`শিডিউল আপডেট করতে সমস্যা: ${error.message}`);
    },
  });
};

// Delete timetable entry
export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('শিডিউল মুছে ফেলা হয়েছে');
    },
    onError: (error: Error) => {
      toast.error(`শিডিউল মুছতে সমস্যা: ${error.message}`);
    },
  });
};

// Get timetable for a specific class grouped by day
export const useTimetableByDay = (department: string, className: string) => {
  return useQuery({
    queryKey: ['timetable-by-day', department, className],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timetables')
        .select(`
          *,
          teacher:staff(id, name, designation)
        `)
        .eq('department', department)
        .eq('class_name', className)
        .eq('is_active', true)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      // Group by day
      const grouped: Record<string, Timetable[]> = {};
      DAYS_OF_WEEK.forEach(day => {
        grouped[day] = (data as Timetable[]).filter(t => t.day_of_week === day);
      });
      
      return grouped;
    },
    enabled: !!(department && className),
  });
};
