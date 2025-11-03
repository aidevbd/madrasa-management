import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Staff {
  id: string;
  staff_id: string;
  name: string;
  designation: string;
  phone: string;
  email: string | null;
  address: string | null;
  salary: number | null;
  join_date: string | null;
  nid: string | null;
  education: string | null;
  photo_url: string | null;
  status: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useStaff() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Staff[];
    },
  });
}

export function useStaffStats(staff: Staff[] | undefined) {
  if (!staff) {
    return {
      total: 0,
      teachers: 0,
      nonTeachers: 0,
      totalSalary: 0,
    };
  }

  const teachers = staff.filter(s => 
    s.designation.includes('শিক্ষক') || 
    s.designation.includes('উস্তাদ') || 
    s.designation.includes('মাওলানা')
  );

  const totalSalary = staff.reduce((sum, s) => sum + (Number(s.salary) || 0), 0);

  return {
    total: staff.length,
    teachers: teachers.length,
    nonTeachers: staff.length - teachers.length,
    totalSalary,
  };
}
