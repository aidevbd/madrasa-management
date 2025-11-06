import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkMarkAttendance } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { useStaff } from "@/hooks/useStaff";
import { Search, Save } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  id: string;
  name: string;
  status: 'উপস্থিত' | 'অনুপস্থিত' | 'ছুটি' | 'বিলম্বে';
  remarks?: string;
}

interface DailyAttendanceFormProps {
  type: 'student' | 'staff';
  date: string;
}

export function DailyAttendanceForm({ type, date }: DailyAttendanceFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});

  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: staff, isLoading: staffLoading } = useStaff();
  const bulkMarkAttendance = useBulkMarkAttendance();

  const loading = type === 'student' ? studentsLoading : staffLoading;
  const dataList = type === 'student' ? students : staff;

  const filteredData = dataList?.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type === 'student' ? (item as any).student_id : (item as any).staff_id)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleStatusChange = (id: string, name: string, status: AttendanceRecord['status']) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: { id, name, status, remarks: prev[id]?.remarks }
    }));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: { ...prev[id], remarks }
    }));
  };

  const handleSaveAll = async () => {
    const records = Object.values(attendanceRecords).map(record => ({
      user_id: record.id,
      user_type: type,
      date,
      status: record.status,
      remarks: record.remarks,
    }));

    if (records.length === 0) {
      return;
    }

    await bulkMarkAttendance.mutateAsync(records);
    setAttendanceRecords({});
  };

  const handleMarkAllPresent = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    filteredData.forEach(item => {
      newRecords[item.id] = {
        id: item.id,
        name: item.name,
        status: 'উপস্থিত',
      };
    });
    setAttendanceRecords(newRecords);
  };

  const getStatusBadge = (status?: AttendanceRecord['status']) => {
    if (!status) return <Badge variant="outline">নির্বাচন করুন</Badge>;
    
    const variants = {
      'উপস্থিত': 'bg-success/10 text-success hover:bg-success/20',
      'অনুপস্থিত': 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      'ছুটি': 'bg-primary/10 text-primary hover:bg-primary/20',
      'বিলম্বে': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    };

    return <Badge className={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>
              {format(new Date(date), 'dd MMMM yyyy')} - দৈনিক উপস্থিতি
            </CardTitle>
            <CardDescription>
              {type === 'student' ? 'ছাত্রদের' : 'স্টাফদের'} উপস্থিতি চিহ্নিত করুন
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleMarkAllPresent}
              disabled={filteredData.length === 0}
            >
              সবাই উপস্থিত
            </Button>
            <Button 
              onClick={handleSaveAll}
              disabled={Object.keys(attendanceRecords).length === 0 || bulkMarkAttendance.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              সংরক্ষণ করুন
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="নাম বা আইডি দিয়ে সার্চ করুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredData.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              কোন তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead className="hidden sm:table-cell">আইডি</TableHead>
                    <TableHead>অবস্থা</TableHead>
                    <TableHead className="hidden md:table-cell">মন্তব্য</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-sm">
                        {type === 'student' ? (item as any).student_id : (item as any).staff_id}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={attendanceRecords[item.id]?.status || ''}
                          onValueChange={(value) => handleStatusChange(
                            item.id, 
                            item.name, 
                            value as AttendanceRecord['status']
                          )}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              {getStatusBadge(attendanceRecords[item.id]?.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="উপস্থিত">উপস্থিত</SelectItem>
                            <SelectItem value="অনুপস্থিত">অনুপস্থিত</SelectItem>
                            <SelectItem value="ছুটি">ছুটি</SelectItem>
                            <SelectItem value="বিলম্বে">বিলম্বে</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Input
                          placeholder="মন্তব্য (ঐচ্ছিক)"
                          value={attendanceRecords[item.id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          className="max-w-xs"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
