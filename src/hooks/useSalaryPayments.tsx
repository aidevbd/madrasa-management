import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalaryPayment {
  id: string;
  payment_id: string;
  staff_id: string;
  month: string;
  year: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryPaymentWithStaff extends SalaryPayment {
  staff: {
    name: string;
    staff_id: string;
    designation: string;
    phone: string;
  };
}

export function useSalaryPayments() {
  return useQuery({
    queryKey: ["salary-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_payments")
        .select(`
          *,
          staff:staff_id (
            name,
            staff_id,
            designation,
            phone
          )
        `)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as SalaryPaymentWithStaff[];
    },
  });
}

export function useCreateSalaryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<SalaryPayment, "id" | "created_at" | "updated_at" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("salary_payments")
        .insert({
          ...payment,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      toast.success("বেতন প্রদান সফল হয়েছে");
    },
    onError: (error: any) => {
      toast.error(error.message || "বেতন প্রদান ব্যর্থ হয়েছে");
    },
  });
}

export function useSalaryStats(payments: SalaryPaymentWithStaff[] | undefined, currentMonth: string, currentYear: number) {
  if (!payments) {
    return {
      totalPaidThisMonth: 0,
      totalPaidThisYear: 0,
      pendingPayments: 0,
      totalStaffPaid: 0,
    };
  }

  const thisMonthPayments = payments.filter(
    p => p.month === currentMonth && p.year === currentYear
  );

  const thisYearPayments = payments.filter(p => p.year === currentYear);

  const totalPaidThisMonth = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaidThisYear = thisYearPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter(p => p.status === 'অপরিশোধিত').length;
  const totalStaffPaid = new Set(thisMonthPayments.map(p => p.staff_id)).size;

  return {
    totalPaidThisMonth,
    totalPaidThisYear,
    pendingPayments,
    totalStaffPaid,
  };
}
