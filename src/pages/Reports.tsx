import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useReportsData } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [period, setPeriod] = useState("");
  const [format, setFormat] = useState("");
  const navigate = useNavigate();
  const { data: reportsData, isLoading } = useReportsData();

  const generateReport = () => {
    if (!reportType || !period || !format) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }

    toast.success('রিপোর্ট তৈরি হচ্ছে...');
    // Simulate report generation
    setTimeout(() => {
      toast.success('রিপোর্ট সফলভাবে তৈরি হয়েছে');
    }, 1500);
  };

  const handleReportTypeClick = (type: string) => {
    switch(type) {
      case 'students':
        navigate('/students');
        break;
      case 'staff':
        navigate('/staff');
        break;
      case 'financial':
        navigate('/accounting');
        break;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">রিপোর্ট ও বিশ্লেষণ</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">বিভিন্ন ধরনের রিপোর্ট তৈরি করুন</p>
        </div>
      </div>

      {/* Analytics Charts */}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : reportsData ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>মাসিক আর্থিক প্রবণতা</CardTitle>
              <CardDescription>গত ৬ মাসের আয়, ব্যয় ও নিট লাভ</CardDescription>
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
                  net: {
                    label: "নিট",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="আয়" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ব্যয়" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--destructive))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="নিট" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Fee Collection Trends */}
          <Card>
            <CardHeader>
              <CardTitle>ফি সংগ্রহের ধারা</CardTitle>
              <CardDescription>গত ৬ মাসের ফি সংগ্রহ</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "পরিমাণ",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.feeCollection}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[8, 8, 0, 0]}
                      name="ফি সংগ্রহ"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Salary Payments Trends */}
          <Card>
            <CardHeader>
              <CardTitle>বেতন প্রদানের ধারা</CardTitle>
              <CardDescription>গত ৬ মাসের বেতন প্রদান</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "পরিমাণ",
                    color: "hsl(var(--accent))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.salaryPayments}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--accent))" 
                      radius={[8, 8, 0, 0]}
                      name="বেতন প্রদান"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>আর্থিক সারাংশ</CardTitle>
              <CardDescription>বর্তমান মাসের আর্থিক অবস্থা</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportsData.monthlyTrends.slice(-1).map((data, index) => {
                  const netProfit = data.নিট;
                  const isProfit = netProfit > 0;
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">মোট আয়</p>
                            <p className="text-xl font-bold text-success">৳ {data.আয়.toLocaleString('bn-BD')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">মোট ব্যয়</p>
                            <p className="text-xl font-bold text-destructive">৳ {data.ব্যয়.toLocaleString('bn-BD')}</p>
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between p-4 rounded-lg ${isProfit ? 'bg-primary/10' : 'bg-warning/10'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${isProfit ? 'bg-primary' : 'bg-warning'} flex items-center justify-center`}>
                            {isProfit ? (
                              <TrendingUp className="w-5 h-5 text-white" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">নিট {isProfit ? 'লাভ' : 'ক্ষতি'}</p>
                            <p className={`text-xl font-bold ${isProfit ? 'text-primary' : 'text-warning'}`}>
                              ৳ {Math.abs(netProfit).toLocaleString('bn-BD')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Report Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReportTypeClick('students')}>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">ছাত্র রিপোর্ট</CardTitle>
                <CardDescription className="text-xs md:text-sm">উপস্থিতি ও পারফরম্যান্স</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReportTypeClick('staff')}>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">স্টাফ রিপোর্ট</CardTitle>
                <CardDescription className="text-xs md:text-sm">বেতন ও উপস্থিতি</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReportTypeClick('financial')}>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">আর্থিক রিপোর্ট</CardTitle>
                <CardDescription className="text-xs md:text-sm">আয় ও ব্যয় বিশ্লেষণ</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">রিপোর্ট তৈরি করুন</CardTitle>
          <CardDescription className="text-xs md:text-sm">রিপোর্টের ধরন ও সময়কাল নির্বাচন করুন</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">রিপোর্টের ধরন</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">ছাত্র রিপোর্ট</SelectItem>
                  <SelectItem value="staff">স্টাফ রিপোর্ট</SelectItem>
                  <SelectItem value="financial">আর্থিক রিপোর্ট</SelectItem>
                  <SelectItem value="attendance">উপস্থিতি রিপোর্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">সময়কাল</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">দৈনিক</SelectItem>
                  <SelectItem value="weekly">সাপ্তাহিক</SelectItem>
                  <SelectItem value="monthly">মাসিক</SelectItem>
                  <SelectItem value="yearly">বাৎসরিক</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ফরম্যাট</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="print">প্রিন্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="flex-1 sm:flex-none" onClick={generateReport}>
              <Download className="w-4 h-4 mr-2" />
              রিপোর্ট ডাউনলোড করুন
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={generateReport}>
              <Printer className="w-4 h-4 mr-2" />
              প্রিন্ট করুন
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">সাম্প্রতিক রিপোর্ট</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-3">
            {[
              { name: "মাসিক ছাত্র উপস্থিতি - অক্টোবর ২০২৫", date: "২৮ অক্টোবর ২০২৫", type: "ছাত্র" },
              { name: "স্টাফ বেতন রিপোর্ট - অক্টোবর ২০২৫", date: "২৫ অক্টোবর ২০২৫", type: "স্টাফ" },
              { name: "আয়-ব্যয় সারাংশ - সেপ্টেম্বর ২০২৫", date: "১৫ অক্টোবর ২০২৫", type: "আর্থিক" },
            ].map((report, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border hover:bg-accent/5 transition-colors gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base">{report.name}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{report.date}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Badge variant="outline" className="text-xs">{report.type}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
