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
import { useState } from "react";
import { StudentForm } from "@/components/forms/StudentForm";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const [showStudentForm, setShowStudentForm] = useState(false);
  const navigate = useNavigate();

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
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-muted-foreground">শিশুশ্রেণি</span>
                <span className="font-medium text-sm md:text-base">৮৫ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-muted-foreground">নূরানী</span>
                <span className="font-medium text-sm md:text-base">৭২ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-muted-foreground">নাজেরা</span>
                <span className="font-medium text-sm md:text-base">৬৪ জন</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-sm md:text-base">মোট</span>
                  <span className="text-primary text-sm md:text-base">{stats.students.maktab} জন</span>
                </div>
              </div>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">গ্রুপ ক</span>
                <span className="font-medium">৪৮ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">গ্রুপ খ</span>
                <span className="font-medium">৫৫ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">গ্রুপ গ</span>
                <span className="font-medium">৩৯ জন</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>মোট</span>
                  <span className="text-success">{stats.students.hifz} জন</span>
                </div>
              </div>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ইবতিদাইয়্যা</span>
                <span className="font-medium">৬২ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">মুতাওয়াসসিতা</span>
                <span className="font-medium">৭৮ জন</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">তাকমিল</span>
                <span className="font-medium">৬৫ জন</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>মোট</span>
                  <span className="text-accent-foreground">{stats.students.kitab} জন</span>
                </div>
              </div>
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
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">নতুন ছাত্র ভর্তি</p>
                <p className="text-xs text-muted-foreground">মুহাম্মদ আবদুল্লাহ - হিফজ বিভাগ</p>
                <p className="text-xs text-muted-foreground">২ ঘণ্টা আগে</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">বোর্ডিং ফি পরিশোধ</p>
                <p className="text-xs text-muted-foreground">১৫ জন ছাত্রের ফি গ্রহণ করা হয়েছে</p>
                <p className="text-xs text-muted-foreground">৫ ঘণ্টা আগে</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">মাসিক রিপোর্ট তৈরি</p>
                <p className="text-xs text-muted-foreground">অক্টোবর ২০২৫ এর রিপোর্ট প্রস্তুত</p>
                <p className="text-xs text-muted-foreground">গতকাল</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">আসন্ন কার্যক্রম</CardTitle>
            <CardDescription className="text-xs md:text-sm">করণীয় কাজসমূহ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">পরীক্ষা শুরু</p>
                <p className="text-xs text-muted-foreground">কিতাব বিভাগের বার্ষিক পরীক্ষা</p>
                <p className="text-xs font-medium text-destructive">৫ দিন বাকি</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">বেতন প্রদান</p>
                <p className="text-xs text-muted-foreground">স্টাফদের মাসিক বেতন বিতরণ</p>
                <p className="text-xs font-medium text-warning">১০ দিন বাকি</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-info" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">মাসিক মিটিং</p>
                <p className="text-xs text-muted-foreground">শিক্ষক-কর্মচারী সমাবেশ</p>
                <p className="text-xs font-medium text-info">১৫ দিন বাকি</p>
              </div>
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
