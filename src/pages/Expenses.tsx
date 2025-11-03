import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses, useExpenseStats } from "@/hooks/useExpenses";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: expenses, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses("monthly");
  const expenseStats = useExpenseStats(expenses);
  
  const { data: transactions } = useTransactions("monthly");
  const transactionStats = useTransactionStats(transactions);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(Math.round(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const filteredExpenses = expenses?.filter(expense => {
    const matchesSearch = searchTerm === "" || 
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const exportExpensesToCSV = () => {
    if (!expenses || expenses.length === 0) {
      toast.error('কোন ডেটা নেই');
      return;
    }

    const headers = ['তারিখ', 'আইডি', 'শিরোনাম', 'ক্যাটাগরি', 'পরিমাণ', 'বিবরণ'];
    const csvData = expenses.map(e => [
      e.expense_date,
      e.expense_id,
      e.title,
      e.category,
      e.amount,
      e.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('রিপোর্ট ডাউনলোড সফল হয়েছে');
  };

  if (expensesLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">বাজার খরচ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">দৈনন্দিন বাজার ও বোর্ডিং খরচ</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="flex-1 sm:flex-none" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">নতুন খরচ যুক্ত করুন</span>
            <span className="sm:hidden">নতুন খরচ</span>
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportExpensesToCSV}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">রিপোর্ট ডাউনলোড</span>
            <span className="sm:hidden">ডাউনলোড</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              আজকের খরচ
            </CardDescription>
            <CardTitle className="text-3xl text-destructive">৳ {formatCurrency(expenseStats.daily)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>সাপ্তাহিক খরচ</CardDescription>
            <CardTitle className="text-3xl">৳ {formatCurrency(expenseStats.weekly)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মাসিক খরচ</CardDescription>
            <CardTitle className="text-3xl">৳ {formatCurrency(expenseStats.monthly)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              মাসিক আয়
            </CardDescription>
            <CardTitle className="text-3xl text-success">৳ {formatCurrency(transactionStats.totalIncome)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Income Sources */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">আয়ের উৎসসমূহ</CardTitle>
          <CardDescription className="text-xs md:text-sm">এই মাসের আয় বিবরণ</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transactionStats.incomeByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">কোন আয়ের তথ্য নেই</p>
            ) : (
              transactionStats.incomeByCategory.slice(0, 3).map((item, i) => {
                const percentage = ((item.amount / transactionStats.totalIncome) * 100).toFixed(0);
                const colors = [
                  { bg: "from-success/5 to-success/0", text: "text-success", badge: "bg-success/10 text-success" },
                  { bg: "from-primary/5 to-primary/0", text: "text-primary", badge: "bg-primary/10 text-primary" },
                  { bg: "from-accent/5 to-accent/0", text: "text-accent-foreground", badge: "bg-accent/10 text-accent-foreground" }
                ];
                const color = colors[i % colors.length];
                return (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-lg border bg-gradient-to-br ${color.bg}`}>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className={`text-2xl font-bold ${color.text}`}>৳ {formatCurrency(item.amount)}</p>
                    </div>
                    <Badge className={color.badge}>{percentage}%</Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">খরচের তালিকা</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="খরচের শিরোনাম বা আইডি দিয়ে সার্চ করুন..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ক্যাটাগরি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল ক্যাটাগরি</SelectItem>
                <SelectItem value="বাজার">বাজার</SelectItem>
                <SelectItem value="বেতন">বেতন</SelectItem>
                <SelectItem value="বিদ্যুৎ">বিদ্যুৎ</SelectItem>
                <SelectItem value="পানি">পানি</SelectItem>
                <SelectItem value="গ্যাস">গ্যাস</SelectItem>
                <SelectItem value="রক্ষণাবেক্ষণ">রক্ষণাবেক্ষণ</SelectItem>
                <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">তারিখ</TableHead>
                  <TableHead className="whitespace-nowrap">শিরোনাম</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">ক্যাটাগরি</TableHead>
                  <TableHead className="whitespace-nowrap">পরিমাণ (৳)</TableHead>
                  <TableHead className="whitespace-nowrap hidden lg:table-cell">বিবরণ</TableHead>
                  <TableHead className="text-right whitespace-nowrap">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      কোনো খরচের তথ্য পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium whitespace-nowrap text-xs md:text-sm">{formatDate(expense.expense_date)}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap text-xs md:text-sm">{expense.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="whitespace-nowrap text-xs">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold whitespace-nowrap text-xs md:text-sm">{formatCurrency(Number(expense.amount))}</TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell text-xs md:text-sm max-w-xs truncate">{expense.description || '-'}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="text-xs md:text-sm">বিস্তারিত</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ExpenseForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          refetchExpenses();
          setIsFormOpen(false);
        }} 
      />
    </div>
  );
}
