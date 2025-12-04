import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { StudentForm } from "@/components/forms/StudentForm";
import { useStudents, useDeleteStudent, Student } from "@/hooks/useStudents";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const { data: students, isLoading: loading, refetch } = useStudents();
  const deleteStudent = useDeleteStudent();

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

  const handleDelete = (id: string) => {
    deleteStudent.mutate(id, {
      onSuccess: () => {
        toast.success('ছাত্র মুছে ফেলা হয়েছে');
        refetch();
      },
      onError: () => toast.error('ছাত্র মুছতে সমস্যা হয়েছে')
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowAddForm(true);
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
          <Button className="flex-1 sm:flex-none" onClick={() => { setEditingStudent(null); setShowAddForm(true); }}>
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
          {filteredStudents.length === 0 ? (
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
                      <TableCell className="text-right whitespace-nowrap space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewingStudent(student)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ছাত্র মুছে ফেলুন?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{student.name}" কে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(student.id)}>মুছুন</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ছাত্রের বিস্তারিত তথ্য</DialogTitle>
            <DialogDescription>সম্পূর্ণ প্রোফাইল</DialogDescription>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {viewingStudent.photo_url ? (
                  <img src={viewingStudent.photo_url} alt={viewingStudent.name} className="w-24 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {viewingStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{viewingStudent.name}</h3>
                  <p className="text-muted-foreground">আইডি: {viewingStudent.student_id}</p>
                  <Badge className="mt-2">{viewingStudent.status}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">বিভাগ</Label>
                  <p className="font-medium">{viewingStudent.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">শ্রেণি</Label>
                  <p className="font-medium">{viewingStudent.class_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">পিতার নাম</Label>
                  <p className="font-medium">{viewingStudent.father_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">মাতার নাম</Label>
                  <p className="font-medium">{viewingStudent.mother_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">অভিভাবকের ফোন</Label>
                  <p className="font-medium font-mono">{viewingStudent.guardian_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">নিজের ফোন</Label>
                  <p className="font-medium font-mono">{viewingStudent.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">জন্ম তারিখ</Label>
                  <p className="font-medium">
                    {viewingStudent.date_of_birth ? format(new Date(viewingStudent.date_of_birth), 'dd MMM yyyy', { locale: bn }) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">ভর্তির তারিখ</Label>
                  <p className="font-medium">
                    {viewingStudent.admission_date ? format(new Date(viewingStudent.admission_date), 'dd MMM yyyy', { locale: bn }) : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">ঠিকানা</Label>
                  <p className="font-medium">{viewingStudent.address || '-'}</p>
                </div>
                {viewingStudent.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground text-xs">নোট</Label>
                    <p className="font-medium">{viewingStudent.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setViewingStudent(null); handleEdit(viewingStudent); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  সম্পাদনা
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StudentForm
        open={showAddForm}
        onOpenChange={(open) => { setShowAddForm(open); if (!open) setEditingStudent(null); }}
        onSuccess={() => {
          refetch();
          setShowAddForm(false);
          setEditingStudent(null);
        }}
        editData={editingStudent}
      />
    </div>
  );
}
