import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Attendance {
  id: string;
  user_id: string;
  user_type: 'student' | 'staff';
  date: string;
  status: 'উপস্থিত' | 'অনুপস্থিত' | 'ছুটি' | 'বিলম্বে';
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  late_days: number;
  attendance_percentage: number;
}

export const useAttendance = (userType: 'student' | 'staff', date?: string) => {
  return useQuery({
    queryKey: ['attendance', userType, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('user_type', userType)
        .order('date', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Attendance[];
    },
  });
};

export const useAttendanceStats = (
  userId: string,
  userType: 'student' | 'staff',
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['attendance-stats', userId, userType, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_attendance_stats', {
        p_user_id: userId,
        p_user_type: userType,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      return data?.[0] as AttendanceStats;
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceData: {
      user_id: string;
      user_type: 'student' | 'staff';
      date: string;
      status: 'উপস্থিত' | 'অনুপস্থিত' | 'ছুটি' | 'বিলম্বে';
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          ...attendanceData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('উপস্থিতি সংরক্ষিত হয়েছে');
    },
    onError: () => {
      toast.error('উপস্থিতি সংরক্ষণ ব্যর্থ হয়েছে');
    },
  });
};

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceRecords: Array<{
      user_id: string;
      user_type: 'student' | 'staff';
      date: string;
      status: 'উপস্থিত' | 'অনুপস্থিত' | 'ছুটি' | 'বিলম্বে';
      remarks?: string;
    }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const recordsWithCreator = attendanceRecords.map(record => ({
        ...record,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from('attendance')
        .upsert(recordsWithCreator)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('সকল উপস্থিতি সংরক্ষিত হয়েছে');
    },
    onError: () => {
      toast.error('উপস্থিতি সংরক্ষণ ব্যর্থ হয়েছে');
    },
  });
};
