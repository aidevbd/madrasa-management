import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Clock, Calendar, Trash2, Edit } from 'lucide-react';
import { useTimetable, useTimetableByDay, useDeleteTimetable, DAYS_OF_WEEK, Timetable as TimetableType } from '@/hooks/useTimetable';
import TimetableForm from '@/components/forms/TimetableForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Timetable = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('মক্তব');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  const { data: timetableByDay, isLoading } = useTimetableByDay(selectedDepartment, selectedClass);
  const { data: allTimetable } = useTimetable();
  const deleteMutation = useDeleteTimetable();

  // Get unique classes for selected department
  const availableClasses = [...new Set(allTimetable?.filter(t => t.department === selectedDepartment).map(t => t.class_name) || [])];

  const handleEdit = (entry: TimetableType) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getDayColor = (day: string): string => {
    const colors: Record<string, string> = {
      'শনিবার': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'রবিবার': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'সোমবার': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'মঙ্গলবার': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'বুধবার': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'বৃহস্পতিবার': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'শুক্রবার': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading && selectedClass) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">ক্লাস শিডিউল</h1>
            <p className="text-muted-foreground">সাপ্তাহিক ক্লাস রুটিন পরিচালনা</p>
          </div>
          <Button onClick={() => { setEditingEntry(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> নতুন শিডিউল
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">মোট ক্লাস</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTimetable?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">আজকের ক্লাস</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allTimetable?.filter(t => {
                  const today = new Date().getDay();
                  const dayMap: Record<number, string> = {
                    0: 'রবিবার', 1: 'সোমবার', 2: 'মঙ্গলবার',
                    3: 'বুধবার', 4: 'বৃহস্পতিবার', 5: 'শুক্রবার', 6: 'শনিবার'
                  };
                  return t.day_of_week === dayMap[today];
                }).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">বিভাগ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(allTimetable?.map(t => t.department))].length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedDepartment} onValueChange={(v) => { setSelectedDepartment(v); setSelectedClass(''); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="বিভাগ নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="মক্তব">মক্তব</SelectItem>
              <SelectItem value="হিফজ">হিফজ</SelectItem>
              <SelectItem value="কিতাব">কিতাব</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="শ্রেণী নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.length > 0 ? (
                availableClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>কোনো শ্রেণী নেই</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Timetable Display */}
        {selectedClass ? (
          <div className="space-y-4">
            {DAYS_OF_WEEK.filter(day => day !== 'শুক্রবার').map((day) => (
              <Card key={day}>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={getDayColor(day)}>{day}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ({timetableByDay?.[day]?.length || 0} ক্লাস)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {timetableByDay?.[day]?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>সময়</TableHead>
                          <TableHead>বিষয়</TableHead>
                          <TableHead>শিক্ষক</TableHead>
                          <TableHead>রুম</TableHead>
                          <TableHead className="text-right">একশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timetableByDay[day].map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono">
                              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            </TableCell>
                            <TableCell className="font-medium">{entry.subject}</TableCell>
                            <TableCell>{entry.teacher?.name || 'নির্ধারিত নয়'}</TableCell>
                            <TableCell>{entry.room_number || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      এই দিনে কোনো ক্লাস নেই
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>শিডিউল দেখতে বিভাগ ও শ্রেণী নির্বাচন করুন</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form */}
      <TimetableForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingEntry={editingEntry}
        onSuccess={() => { setIsFormOpen(false); setEditingEntry(null); }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>শিডিউল মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই শিডিউল স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Timetable;
