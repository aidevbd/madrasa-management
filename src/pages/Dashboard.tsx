import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  FileText,
  Calendar,
  DollarSign
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { StudentForm } from "@/components/forms/StudentForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStudents } from "@/hooks/useStudents";
import { useExpenses } from "@/hooks/useExpenses";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const navigate = useNavigate();
  const { data: students } = useStudents();
  const { data: expenses } = useExpenses("monthly");

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent students
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentStudents(studentsData || []);

      // Fetch recent expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      setRecentExpenses(expensesData || []);

      // Fetch recent notices
      const { data: noticesData } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      setRecentNotices(noticesData || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'এইমাত্র';
    if (diffInHours < 24) return `${diffInHours} ঘণ্টা আগে`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'গতকাল';
    if (diffInDays < 7) return `${diffInDays} দিন আগে`;
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(Math.round(amount));
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!stats) return null;
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">স্বাগতম</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">মাদ্রাসা ম্যানেজমেন্ট ড্যাশবোর্ড</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="flex-1 sm:flex-none" onClick={() => setShowStudentForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">নতুন ছাত্র</span>
            <span className="sm:hidden">ছাত্র</span>
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => navigate('/reports')}>
            <FileText className="w-4 h-4 mr-2" />
            রিপোর্ট
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="মোট ছাত্র"
          value={stats.students.total.toString()}
          icon={GraduationCap}
          description="সকল বিভাগ"
          variant="primary"
        />
        <StatCard
          title="মোট স্টাফ"
          value={stats.staff.total.toString()}
          icon={Users}
          description="শিক্ষক ও কর্মচারী"
          variant="success"
        />
        <StatCard
          title="মাসিক আয়"
          value={`৳ ${formatCurrency(stats.finance.monthlyIncome)}`}
          icon={TrendingUp}
          description="বোর্ডিং ফি ও দান"
          variant="success"
        />
        <StatCard
          title="মাসিক ব্যয়"
          value={`৳ ${formatCurrency(stats.finance.monthlyExpense)}`}
          icon={TrendingDown}
          description="বাজার ও বেতন"
          variant="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Student Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>বিভাগ অনুযায়ী ছাত্র বিতরণ</CardTitle>
            <CardDescription>প্রতিটি বিভাগে ছাত্রদের সংখ্যা</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                maktab: {
                  label: "মক্তব",
                  color: "hsl(var(--primary))",
                },
                hifz: {
                  label: "হিফজ",
                  color: "hsl(var(--success))",
                },
                kitab: {
                  label: "কিতাব",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "মক্তব", value: stats.students.maktab, fill: "hsl(var(--primary))" },
                      { name: "হিফজ", value: stats.students.hifz, fill: "hsl(var(--success))" },
                      { name: "কিতাব", value: stats.students.kitab, fill: "hsl(var(--accent))" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader>
            <CardTitle>আয় বনাম ব্যয়</CardTitle>
            <CardDescription>চলতি মাসের আর্থিক পরিস্থিতি</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: {
                  label: "আয়",
                  color: "hsl(var(--success))",
                },
                expense: {
                  label: "ব্যয়",
                  color: "hsl(var(--destructive))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "চলতি মাস",
                      আয়: stats.finance.monthlyIncome,
                      ব্যয়: stats.finance.monthlyExpense,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="আয়" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ব্যয়" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-smooth hover:shadow-md border-l-4 border-l-primary">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              মক্তব বিভাগ
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">শিশু ও নূরানী শিক্ষা</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm md:text-base">মোট ছাত্র</span>
                <span className="text-primary text-2xl md:text-3xl">{stats.students.maktab} জন</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                শিশুশ্রেণি, নূরানী ও নাজেরা বিভাগের সকল ছাত্র
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:shadow-md border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-success" />
              </div>
              হিফজ বিভাগ
            </CardTitle>
            <CardDescription>কুরআন হিফজ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm md:text-base">মোট ছাত্র</span>
                <span className="text-success text-2xl md:text-3xl">{stats.students.hifz} জন</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                কুরআন হিফজ বিভাগের সকল ছাত্র
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:shadow-md border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-accent-foreground" />
              </div>
              কিতাব বিভাগ
            </CardTitle>
            <CardDescription>উচ্চতর শিক্ষা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm md:text-base">মোট ছাত্র</span>
                <span className="text-accent-foreground text-2xl md:text-3xl">{stats.students.kitab} জন</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ইবতিদাইয়্যা, মুতাওয়াসসিতা ও তাকমিল এর সকল ছাত্র
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">সাম্প্রতিক কার্যক্রম</CardTitle>
            <CardDescription className="text-xs md:text-sm">আজকের গুরুত্বপূর্ণ আপডেট</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
            {recentStudents.length === 0 && recentExpenses.length === 0 && recentNotices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">এখনও কোন কার্যক্রম নেই</p>
            ) : (
              <>
                {recentStudents.slice(0, 2).map((student) => (
                  <div key={student.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">নতুন ছাত্র ভর্তি</p>
                      <p className="text-xs text-muted-foreground">{student.name} - {student.department} বিভাগ</p>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(student.created_at)}</p>
                    </div>
                  </div>
                ))}
                {recentExpenses.slice(0, 1).map((expense) => (
                  <div key={expense.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">নতুন খরচ</p>
                      <p className="text-xs text-muted-foreground">{expense.title} - ৳{expense.amount}</p>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(expense.created_at)}</p>
                    </div>
                  </div>
                ))}
                {recentNotices.slice(0, 1).map((notice) => (
                  <div key={notice.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">নতুন নোটিশ</p>
                      <p className="text-xs text-muted-foreground">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(notice.created_at)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">আসন্ন কার্যক্রম</CardTitle>
            <CardDescription className="text-xs md:text-sm">করণীয় কাজসমূহ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">আসন্ন ইভেন্ট</p>
              <p className="text-xs text-muted-foreground mt-1">
                এখানে আসন্ন পরীক্ষা, মিটিং, এবং অন্যান্য<br />গুরুত্বপূর্ণ কার্যক্রম দেখানো হবে
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate('/notices')}
              >
                নোটিশ দেখুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentForm
        open={showStudentForm}
        onOpenChange={setShowStudentForm}
        onSuccess={() => {
          setShowStudentForm(false);
          navigate('/students');
        }}
      />
    </div>
  );
}
