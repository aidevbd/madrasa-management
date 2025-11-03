import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Expense {
  id: string;
  expense_id: string;
  title: string;
  category: Database["public"]["Enums"]["expense_category"];
  amount: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useExpenses(timeFilter: string = "monthly") {
  return useQuery({
    queryKey: ["expenses", timeFilter],
    queryFn: async () => {
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
        .from("expenses")
        .select("*")
        .gte("expense_date", startDate.toISOString().split('T')[0])
        .order("expense_date", { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
  });
}

export function useExpenseStats(expenses: Expense[] | undefined) {
  if (!expenses) {
    return {
      total: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      byCategory: [],
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const daily = expenses
    .filter(e => new Date(e.expense_date) >= today)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const weekly = expenses
    .filter(e => new Date(e.expense_date) >= weekAgo)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthly = expenses
    .filter(e => new Date(e.expense_date) >= monthStart)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = expenses
    .reduce((acc, e) => {
      const existing = acc.find(item => item.category === e.category);
      if (existing) {
        existing.amount += Number(e.amount);
        existing.count += 1;
      } else {
        acc.push({ category: e.category, amount: Number(e.amount), count: 1 });
      }
      return acc;
    }, [] as { category: string; amount: number; count: number }[])
    .sort((a, b) => b.amount - a.amount);

  return {
    total: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    daily,
    weekly,
    monthly,
    byCategory,
  };
}
