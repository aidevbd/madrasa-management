import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Fetch all data in parallel
      const [studentsRes, staffRes, transactionsRes, expensesRes] = await Promise.all([
        supabase.from("students").select("id, department, status"),
        supabase.from("staff").select("id, salary"),
        supabase.from("transactions").select("amount, type, transaction_date").gte("transaction_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
        supabase.from("expenses").select("amount, expense_date").gte("expense_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (staffRes.error) throw staffRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (expensesRes.error) throw expensesRes.error;

      const students = studentsRes.data || [];
      const staff = staffRes.data || [];
      const transactions = transactionsRes.data || [];
      const expenses = expensesRes.data || [];

      // Calculate stats
      const totalStudents = students.filter(s => s.status === 'সক্রিয়').length;
      const maktabStudents = students.filter(s => s.department === 'মক্তব' && s.status === 'সক্রিয়').length;
      const hifzStudents = students.filter(s => s.department === 'হিফজ' && s.status === 'সক্রিয়').length;
      const kitabStudents = students.filter(s => s.department === 'কিতাব' && s.status === 'সক্রিয়').length;

      const totalStaff = staff.length;

      const monthlyIncome = transactions
        .filter(t => t.type === 'আয়')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlyExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        students: {
          total: totalStudents,
          maktab: maktabStudents,
          hifz: hifzStudents,
          kitab: kitabStudents,
        },
        staff: {
          total: totalStaff,
        },
        finance: {
          monthlyIncome,
          monthlyExpense,
        },
      };
    },
  });
}
