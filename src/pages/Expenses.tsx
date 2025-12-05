import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, TrendingDown, TrendingUp, ShoppingCart, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses, useExpenseStats, Expense } from "@/hooks/useExpenses";
import { useTransactions, useTransactionStats } from "@/hooks/useTransactions";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { BulkExpenseForm } from "@/components/forms/BulkExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Group expenses by batch_id
interface BatchGroup {
  batch_id: string | null;
  batch_name: string | null;
  date: string;
  items: Expense[];
  totalAmount: number;
}

function groupExpensesByBatch(expenses: Expense[]): BatchGroup[] {
  const batches = new Map<string, BatchGroup>();
  const singles: Expense[] = [];

  expenses.forEach((expense) => {
    if (expense.batch_id) {
      const key = expense.batch_id;
      if (!batches.has(key)) {
        batches.set(key, {
          batch_id: expense.batch_id,
          batch_name: expense.batch_name,
          date: expense.expense_date,
          items: [],
          totalAmount: 0,
        });
      }
      const batch = batches.get(key)!;
      batch.items.push(expense);
      batch.totalAmount += Number(expense.amount);
    } else {
      singles.push(expense);
    }
  });

  // Convert batches to array and add singles as individual groups
  const result: BatchGroup[] = [];
  
  batches.forEach((batch) => {
    result.push(batch);
  });

  singles.forEach((expense) => {
    result.push({
      batch_id: null,
      batch_name: null,
      date: expense.expense_date,
      items: [expense],
      totalAmount: Number(expense.amount),
    });
  });

  // Sort by date descending
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Expense | null>(null);
  
  const queryClient = useQueryClient();
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
      expense.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.batch_name && expense.batch_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const groupedExpenses = groupExpensesByBatch(filteredExpenses);

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("খরচ মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    } catch (error: any) {
      toast.error(error.message || "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleteId(null);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("batch_id", batchId);
      if (error) throw error;
      toast.success("পুরো বাজার মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    } catch (error: any) {
      toast.error(error.message || "মুছতে সমস্যা হয়েছে");
    }
  };

  const exportExpensesToCSV = () => {
    if (!expenses || expenses.length === 0) {
      toast.error('কোন ডেটা নেই');
      return;
    }

    const headers = ['তারিখ', 'আইডি', 'শিরোনাম', 'ক্যাটাগরি', 'পরিমাণ', 'বিবরণ', 'ব্যাচ'];
    const csvData = expenses.map(e => [
      e.expense_date,
      e.expense_id,
      e.title,
      e.category,
      e.amount,
      e.description || '',
      e.batch_name || ''
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
          <Button variant="default" onClick={() => setIsBulkFormOpen(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">বাজার করুন (একাধিক)</span>
            <span className="sm:hidden">বাজার</span>
          </Button>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">একক খরচ</span>
            <span className="sm:hidden">একক</span>
          </Button>
          <Button variant="outline" onClick={exportExpensesToCSV}>
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">রিপোর্ট</span>
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

      {/* Expenses Table with Batch Grouping */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">খরচের তালিকা</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="খরচের শিরোনাম, আইডি বা ব্যাচ দিয়ে সার্চ..."
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
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-3">
            {groupedExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                কোনো খরচের তথ্য পাওয়া যায়নি
              </div>
            ) : (
              groupedExpenses.map((group, index) => {
                const isBatch = group.batch_id !== null;
                const isExpanded = group.batch_id ? expandedBatches.has(group.batch_id) : true;

                if (isBatch) {
                  return (
                    <Collapsible key={group.batch_id || index} open={isExpanded}>
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div 
                            className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                            onClick={() => toggleBatch(group.batch_id!)}
                          >
                            <div className="flex items-center gap-3">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {group.batch_name || "বাজার"}
                                  <Badge variant="secondary" className="text-xs">
                                    {group.items.length}টি আইটেম
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">{formatDate(group.date)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg">৳ {formatCurrency(group.totalAmount)}</span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("পুরো বাজার মুছে ফেলতে চান?")) {
                                      handleDeleteBatch(group.batch_id!);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-background">
                                <TableHead>আইটেম</TableHead>
                                <TableHead>ক্যাটাগরি</TableHead>
                                <TableHead>পরিমাণ</TableHead>
                                <TableHead>বিবরণ</TableHead>
                                <TableHead className="text-right">কার্যক্রম</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.items.map((expense) => (
                                <TableRow key={expense.id}>
                                  <TableCell className="font-medium">{expense.title}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{expense.category}</Badge>
                                  </TableCell>
                                  <TableCell className="font-semibold">৳ {formatCurrency(Number(expense.amount))}</TableCell>
                                  <TableCell className="text-muted-foreground max-w-xs truncate">
                                    {expense.description || '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEditData(expense)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => setDeleteId(expense.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                }

                // Single expense (not in batch)
                const expense = group.items[0];
                return (
                  <div key={expense.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{expense.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {formatDate(expense.expense_date)}
                          <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">৳ {formatCurrency(Number(expense.amount))}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditData(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ExpenseForm 
        open={isFormOpen || !!editData} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditData(null);
        }}
        editData={editData}
        onSuccess={() => {
          refetchExpenses();
          setIsFormOpen(false);
          setEditData(null);
        }} 
      />

      <BulkExpenseForm
        open={isBulkFormOpen}
        onOpenChange={setIsBulkFormOpen}
        onSuccess={() => refetchExpenses()}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই খরচটি মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}