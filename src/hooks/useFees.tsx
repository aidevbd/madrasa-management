import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FeeStructure {
  id: string;
  fee_type: string;
  amount: number;
  frequency: string;
  department?: string;
  class_name?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  fee_structure_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  month?: string;
  year?: number;
  receipt_number?: string;
  remarks?: string;
  created_at: string;
  students?: {
    name: string;
    student_id: string;
    class_name: string;
    department: string;
  };
  fee_structures?: {
    fee_type: string;
  };
}

export const useFeeStructures = () => {
  return useQuery({
    queryKey: ["fee-structures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fee_structures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FeeStructure[];
    },
  });
};

export const useFeePayments = (studentId?: string) => {
  return useQuery({
    queryKey: ["fee-payments", studentId],
    queryFn: async () => {
      let query = supabase
        .from("fee_payments")
        .select(`
          *,
          students(name, student_id, class_name, department),
          fee_structures(fee_type)
        `)
        .order("payment_date", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FeePayment[];
    },
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeStructure: any) => {
      const { data, error } = await supabase
        .from("fee_structures")
        .insert([feeStructure])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("ফি স্ট্রাকচার তৈরি হয়েছে");
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });
};

export const useUpdateFeeStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeeStructure> & { id: string }) => {
      const { data, error } = await supabase
        .from("fee_structures")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("ফি স্ট্রাকচার আপডেট হয়েছে");
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });
};

export const useDeleteFeeStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fee_structures")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("ফি স্ট্রাকচার মুছে ফেলা হয়েছে");
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });
};

export const useRecordFeePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: any) => {
      const { data, error } = await supabase
        .from("fee_payments")
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("পেমেন্ট রেকর্ড হয়েছে");
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });
};

export const useStudentFeeStatus = (studentId: string) => {
  const { data: payments } = useFeePayments(studentId);
  const { data: structures } = useFeeStructures();

  const calculateStatus = () => {
    if (!payments || !structures) return null;

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalDue = structures
      .filter(s => s.is_active)
      .reduce((sum, s) => sum + Number(s.amount), 0);

    return {
      totalPaid,
      totalDue,
      balance: totalDue - totalPaid,
      payments: payments.length,
    };
  };

  return calculateStatus();
};
