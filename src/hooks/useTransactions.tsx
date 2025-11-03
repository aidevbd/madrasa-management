import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Transaction {
  id: string;
  transaction_id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  type: Database["public"]["Enums"]["transaction_type"];
  transaction_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export function useTransactions(timeFilter: string = "monthly") {
  return useQuery({
    queryKey: ["transactions", timeFilter],
    queryFn: async () => {
      // Calculate date range based on filter
      const now = new Date();
      let startDate: Date;
      
      switch (timeFilter) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "monthly":
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", startDate.toISOString().split('T')[0])
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useTransactionStats(transactions: Transaction[] | undefined) {
  if (!transactions) {
    return {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      incomeByCategory: [],
      expenseByCategory: [],
    };
  }

  const totalIncome = transactions
    .filter((t) => t.type === "আয়")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "ব্যয়")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  // Group by category
  const incomeByCategory = transactions
    .filter((t) => t.type === "আয়")
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.category === t.category);
      if (existing) {
        existing.amount += Number(t.amount);
      } else {
        acc.push({ category: t.category, amount: Number(t.amount) });
      }
      return acc;
    }, [] as { category: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount);

  const expenseByCategory = transactions
    .filter((t) => t.type === "ব্যয়")
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.category === t.category);
      if (existing) {
        existing.amount += Number(t.amount);
      } else {
        acc.push({ category: t.category, amount: Number(t.amount) });
      }
      return acc;
    }, [] as { category: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalExpense,
    netBalance,
    incomeByCategory,
    expenseByCategory,
  };
}
