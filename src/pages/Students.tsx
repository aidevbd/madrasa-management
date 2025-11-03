import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { StudentForm } from "@/components/forms/StudentForm";
import { useStudents } from "@/hooks/useStudents";
import { Skeleton } from "@/components/ui/skeleton";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: students, isLoading: loading, refetch } = useStudents();

  const stats = {
    total: students?.length || 0,
    maktab: students?.filter(s => s.department === 'মক্তব').length || 0,
    hifz: students?.filter(s => s.department === 'হিফজ').length || 0,
    kitab: students?.filter(s => s.department === 'কিতাব').length || 0,
  };

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.guardian_phone && student.guardian_phone.includes(searchTerm))
  ) || [];

  const exportToCSV = () => {
    if (!students || students.length === 0) {
      toast.error('কোন ডেটা নেই');
      return;
    }

    const headers = ['আইডি', 'নাম', 'বিভাগ', 'ক্লাস', 'ফোন', 'অভিভাবকের ফোন', 'ঠিকানা'];
    const csvData = students.map(s => [
      s.student_id,
      s.name,
      s.department,
      s.class_name,
      s.phone || '',
      s.guardian_phone,
      s.address || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ডেটা এক্সপোর্ট সফল হয়েছে');
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ছাত্র ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">সকল ছাত্রের তথ্য ও রেকর্ড</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="flex-1 sm:flex-none" onClick={() => setShowAddForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">নতুন ছাত্র যুক্ত করুন</span>
            <span className="sm:hidden">নতুন ছাত্র</span>
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মোট ছাত্র</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মক্তব</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.maktab}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>হিফজ</CardDescription>
            <CardTitle className="text-3xl text-success">{stats.hifz}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>কিতাব</CardDescription>
            <CardTitle className="text-3xl text-accent-foreground">{stats.kitab}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="নাম, আইডি, মোবাইল নম্বর দিয়ে সার্চ করুন..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              ফিল্টার
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              {searchTerm ? 'কোন ছাত্র পাওয়া যায়নি' : 'এখনও কোন ছাত্র যুক্ত করা হয়নি'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">আইডি</TableHead>
                    <TableHead className="whitespace-nowrap">নাম</TableHead>
                    <TableHead className="whitespace-nowrap">বিভাগ</TableHead>
                    <TableHead className="whitespace-nowrap hidden md:table-cell">শ্রেণি</TableHead>
                    <TableHead className="whitespace-nowrap hidden lg:table-cell">মোবাইল</TableHead>
                    <TableHead className="whitespace-nowrap hidden sm:table-cell">অবস্থা</TableHead>
                    <TableHead className="text-right whitespace-nowrap">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium whitespace-nowrap">{student.student_id}</TableCell>
                      <TableCell className="whitespace-nowrap">{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">{student.department}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">{student.class_name}</TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap hidden lg:table-cell">
                        {student.guardian_phone}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="bg-success/10 text-success hover:bg-success/20 whitespace-nowrap">
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm">বিস্তারিত</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <StudentForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={() => {
          refetch();
          setShowAddForm(false);
        }}
      />
    </div>
  );
}