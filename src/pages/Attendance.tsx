import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyAttendanceForm } from "@/components/attendance/DailyAttendanceForm";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { useAttendance, useAttendanceStats } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { useStaff } from "@/hooks/useStaff";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarDays, Download, Users, UserCog } from "lucide-react";
import { toast } from "sonner";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [statsMonth, setStatsMonth] = useState<number>(0); // 0 = current month, 1 = last month, etc.

  const { data: students } = useStudents();
  const { data: staff } = useStaff();

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  // Calculate stats date range
  const statsStartDate = format(startOfMonth(subMonths(new Date(), statsMonth)), 'yyyy-MM-dd');
  const statsEndDate = format(endOfMonth(subMonths(new Date(), statsMonth)), 'yyyy-MM-dd');

  const { data: attendanceStats, isLoading: statsLoading } = useAttendanceStats(
    selectedUser,
    activeTab,
    statsStartDate,
    statsEndDate
  );

  const { data: attendanceRecords } = useAttendance(activeTab, formattedDate);

  const userList = activeTab === 'student' ? students : staff;

  const handleExportReport = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      toast.error('কোন ডেটা নেই');
      return;
    }

    const headers = ['তারিখ', 'নাম', 'অবস্থা', 'মন্তব্য'];
    const csvData = attendanceRecords.map(record => {
      const user = userList?.find(u => u.id === record.user_id);
      return [
        record.date,
        user?.name || 'অজানা',
        record.status,
        record.remarks || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${formattedDate}.csv`;
    link.click();
    toast.success('রিপোর্ট এক্সপোর্ট সফল হয়েছে');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">উপস্থিতি ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            ছাত্র ও স্টাফদের দৈনিক উপস্থিতি নিবন্ধন
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          রিপোর্ট ডাউনলোড
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'student' | 'staff')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="student" className="gap-2">
            <Users className="w-4 h-4" />
            ছাত্র
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <UserCog className="w-4 h-4" />
            স্টাফ
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Statistics Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg md:text-xl">উপস্থিতির পরিসংখ্যান</CardTitle>
                  <CardDescription>
                    {activeTab === 'student' ? 'ছাত্রের' : 'স্টাফের'} মাসিক উপস্থিতি রিপোর্ট
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statsMonth.toString()} onValueChange={(v) => setStatsMonth(Number(v))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">চলতি মাস</SelectItem>
                      <SelectItem value="1">গত মাস</SelectItem>
                      <SelectItem value="2">দুই মাস আগে</SelectItem>
                      <SelectItem value="3">তিন মাস আগে</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {userList?.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <AttendanceStats stats={attendanceStats} loading={statsLoading} />
              ) : (
                <div className="text-center p-12 text-muted-foreground">
                  পরিসংখ্যান দেখতে একজন {activeTab === 'student' ? 'ছাত্র' : 'স্টাফ'} নির্বাচন করুন
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Attendance Form */}
          <div className="grid gap-4 md:grid-cols-[300px_1fr]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  তারিখ নির্বাচন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border w-full"
                />
                {formattedDate !== today && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    আজকের তারিখ
                  </Button>
                )}
              </CardContent>
            </Card>

            <DailyAttendanceForm type={activeTab} date={formattedDate} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
