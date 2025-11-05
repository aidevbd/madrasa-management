import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/forms/TransactionForm";

export default function Accounting() {
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: transactions, isLoading, refetch } = useTransactions(timeFilter);
  const stats = useTransactionStats(transactions);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(Math.round(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const recentTransactions = transactions?.slice(0, 10) || [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">হিসাব সারাংশ</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">আর্থিক ব্যবস্থাপনা ও বিশ্লেষণ</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="flex-1 sm:flex-none" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            নতুন লেনদেন
          </Button>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="সময়কাল" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">দৈনিক</SelectItem>
              <SelectItem value="weekly">সাপ্তাহিক</SelectItem>
              <SelectItem value="monthly">মাসিক</SelectItem>
              <SelectItem value="yearly">বাৎসরিক</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="মোট আয়"
          value={`৳${formatCurrency(stats.totalIncome)}`}
          icon={TrendingUp}
          variant="success"
          description={`${transactions?.filter(t => t.type === 'আয়').length || 0}টি লেনদেন`}
        />
        <StatCard
          title="মোট ব্যয়"
          value={`৳${formatCurrency(stats.totalExpense)}`}
          icon={TrendingDown}
          variant="warning"
          description={`${transactions?.filter(t => t.type === 'ব্যয়').length || 0}টি লেনদেন`}
        />
        <StatCard
          title="নিট ব্যালেন্স"
          value={`৳${formatCurrency(stats.netBalance)}`}
          icon={Wallet}
          variant={stats.netBalance >= 0 ? "primary" : "warning"}
          description="বর্তমান ব্যালেন্স"
        />
        <StatCard
          title="মোট লেনদেন"
          value={transactions?.length.toString() || "০"}
          icon={DollarSign}
          variant="success"
          description="সব লেনদেন"
        />
      </div>

      {/* Income & Expense Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">আয়ের উৎসসমূহ</CardTitle>
            <CardDescription className="text-xs md:text-sm">ক্যাটাগরি অনুযায়ী আয়</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {stats.incomeByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">কোন আয়ের তথ্য নেই</p>
            ) : (
              stats.incomeByCategory.map((item, i) => {
                const percentage = ((item.amount / stats.totalIncome) * 100).toFixed(1);
                const colors = ["bg-primary", "bg-success", "bg-accent", "bg-info", "bg-muted"];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">৳{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">ব্যয়ের বিবরণ</CardTitle>
            <CardDescription className="text-xs md:text-sm">ক্যাটাগরি অনুযায়ী ব্যয়</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {stats.expenseByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">কোন ব্যয়ের তথ্য নেই</p>
            ) : (
              stats.expenseByCategory.map((item, i) => {
                const percentage = ((item.amount / stats.totalExpense) * 100).toFixed(1);
                const colors = ["bg-destructive", "bg-warning", "bg-info", "bg-secondary", "bg-muted"];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">৳{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">সাম্প্রতিক লেনদেন</CardTitle>
          <CardDescription className="text-xs md:text-sm">শেষ ১০টি লেনদেন</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="space-y-2 md:space-y-0">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">কোন লেনদেন নেই</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border-b last:border-b-0 md:border-0 md:rounded-lg md:hover:bg-accent/5 transition-colors gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{transaction.title}</h4>
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(transaction.transaction_date)}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className={`font-semibold text-sm md:text-base ${
                      transaction.type === "আয়" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "আয়" ? "+" : "-"}৳{formatCurrency(Number(transaction.amount))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }} 
      />
    </div>
  );
}
