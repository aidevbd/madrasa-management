import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export function useReportsData() {
  return useQuery({
    queryKey: ["reports-data"],
    queryFn: async () => {
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

      // Fetch transactions for last 6 months
      const transactionsPromises = months.map(async (month) => {
        const start = format(startOfMonth(month), "yyyy-MM-dd");
        const end = format(endOfMonth(month), "yyyy-MM-dd");

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type, transaction_date")
          .gte("transaction_date", start)
          .lte("transaction_date", end);

        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount, expense_date")
          .gte("expense_date", start)
          .lte("expense_date", end);

        const income = transactions
          ?.filter((t) => t.type === "আয়")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const expense = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

        return {
          month: format(month, "MMM"),
          আয়: income,
          ব্যয়: expense,
          নিট: income - expense,
        };
      });

      const monthlyData = await Promise.all(transactionsPromises);

      // Fetch fee payments for last 6 months
      const feePaymentsPromises = months.map(async (month) => {
        const start = format(startOfMonth(month), "yyyy-MM-dd");
        const end = format(endOfMonth(month), "yyyy-MM-dd");

        const { data } = await supabase
          .from("fee_payments")
          .select("amount, payment_date")
          .gte("payment_date", start)
          .lte("payment_date", end);

        return {
          month: format(month, "MMM"),
          amount: data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        };
      });

      const feeCollectionData = await Promise.all(feePaymentsPromises);

      // Fetch salary payments for last 6 months
      const salaryPaymentsPromises = months.map(async (month) => {
        const start = format(startOfMonth(month), "yyyy-MM-dd");
        const end = format(endOfMonth(month), "yyyy-MM-dd");

        const { data } = await supabase
          .from("salary_payments")
          .select("amount, payment_date")
          .gte("payment_date", start)
          .lte("payment_date", end);

        return {
          month: format(month, "MMM"),
          amount: data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        };
      });

      const salaryData = await Promise.all(salaryPaymentsPromises);

      return {
        monthlyTrends: monthlyData,
        feeCollection: feeCollectionData,
        salaryPayments: salaryData,
      };
    },
  });
}
