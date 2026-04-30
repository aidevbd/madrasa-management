import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, Receipt, Home, ClipboardList, LogOut } from "lucide-react";
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  student_id: string;
  name: string;
  department: string;
  class_name: string;
  guardian_phone: string;
  phone: string | null;
  father_name: string | null;
  mother_name: string | null;
  address: string | null;
  date_of_birth: string | null;
  admission_date: string | null;
  status: string | null;
  photo_url: string | null;
}

export default function ParentPortal() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Get linked children for this parent
  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('parent_students')
        .select('student_id, students(*)')
        .eq('parent_user_id', user.id);
      if (error) throw error;
      return (data?.map((d: any) => d.students).filter(Boolean) as Student[]) || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (children && children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].id);
    }
  }, [children, selectedStudentId]);

  const selectedStudent = children?.find((c) => c.id === selectedStudentId) || null;

  const { data: attendance } = useQuery({
    queryKey: ['student-attendance', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', selectedStudent.id)
        .eq('user_type', 'student')
        .order('date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent
  });

  const { data: feePayments } = useQuery({
    queryKey: ['student-fees', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*, fee_structures(fee_type)')
        .eq('student_id', selectedStudent.id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent
  });

  const { data: examResults } = useQuery({
    queryKey: ['student-results', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase
        .from('exam_results')
        .select('*, exams(exam_name, subject, total_marks, pass_marks)')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent
  });

  const { data: hostelAllocation } = useQuery({
    queryKey: ['student-hostel', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const { data, error } = await supabase
        .from('hostel_allocations')
        .select('*, hostel_rooms(room_number, room_type)')
        .eq('student_id', selectedStudent.id)
        .eq('status', 'সক্রিয়')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent
  });

  const { data: homework } = useQuery({
    queryKey: ['student-homework', selectedStudent?.class_name, selectedStudent?.department],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const { data, error } = await supabase
        .from('homework')
        .select('*, staff(name)')
        .eq('department', selectedStudent.department)
        .eq('class_name', selectedStudent.class_name)
        .eq('is_active', true)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStudent
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'উপস্থিত': return 'bg-success';
      case 'অনুপস্থিত': return 'bg-destructive';
      case 'বিলম্বে': return 'bg-orange-500';
      case 'ছুটি': return 'bg-blue-500';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?redirect=/parent-portal" replace />;
  }

  const attendanceStats = {
    total: attendance?.length || 0,
    present: attendance?.filter(a => a.status === 'উপস্থিত').length || 0,
    absent: attendance?.filter(a => a.status === 'অনুপস্থিত').length || 0
  };

  const totalFeesPaid = feePayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">অভিভাবক পোর্টাল</h1>
            <p className="text-muted-foreground mt-1 text-sm">স্বাগতম, {user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </div>

        {childrenLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</CardContent></Card>
        ) : !children || children.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>কোনো সন্তান যুক্ত নেই</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্টের সাথে এখনো কোনো ছাত্র যুক্ত করা হয়নি। অনুগ্রহ করে মাদ্রাসা প্রশাসনের সাথে যোগাযোগ করুন।
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                হোম পেজে যান
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {children.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <Label className="mb-2 block">সন্তান নির্বাচন</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.class_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedStudent && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        {selectedStudent.photo_url ? (
                          <img src={selectedStudent.photo_url} alt={selectedStudent.name} className="w-32 h-32 rounded-lg object-cover" />
                        ) : (
                          <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                            <User className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                            <p className="text-muted-foreground">আইডি: {selectedStudent.student_id}</p>
                          </div>
                          <Badge className="bg-success">{selectedStudent.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-muted-foreground text-xs">বিভাগ</Label>
                            <p className="font-medium">{selectedStudent.department}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">শ্রেণি</Label>
                            <p className="font-medium">{selectedStudent.class_name}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">পিতা</Label>
                            <p className="font-medium">{selectedStudent.father_name || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">মাতা</Label>
                            <p className="font-medium">{selectedStudent.mother_name || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>উপস্থিতি (৩০ দিন)</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-success" />
                        {attendanceStats.present}/{attendanceStats.total}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>মোট ফি প্রদান</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        ৳{totalFeesPaid.toLocaleString('bn-BD')}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>ফলাফল</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-500" />
                        {examResults?.length || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>হোস্টেল রুম</CardDescription>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Home className="w-5 h-5 text-orange-500" />
                        {hostelAllocation?.hostel_rooms?.room_number || 'নেই'}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Tabs defaultValue="attendance" className="space-y-4">
                  <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    <TabsTrigger value="attendance">উপস্থিতি</TabsTrigger>
                    <TabsTrigger value="fees">ফি</TabsTrigger>
                    <TabsTrigger value="results">ফলাফল</TabsTrigger>
                    <TabsTrigger value="homework">হোমওয়ার্ক</TabsTrigger>
                  </TabsList>

                  <TabsContent value="attendance">
                    <Card>
                      <CardHeader><CardTitle>সাম্প্রতিক উপস্থিতি</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>তারিখ</TableHead>
                              <TableHead>অবস্থা</TableHead>
                              <TableHead>মন্তব্য</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attendance?.map(a => (
                              <TableRow key={a.id}>
                                <TableCell>{format(new Date(a.date), 'dd MMM yyyy', { locale: bn })}</TableCell>
                                <TableCell><Badge className={getStatusColor(a.status)}>{a.status}</Badge></TableCell>
                                <TableCell>{a.remarks || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="fees">
                    <Card>
                      <CardHeader><CardTitle>ফি প্রদানের ইতিহাস</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>তারিখ</TableHead>
                              <TableHead>ফি ধরন</TableHead>
                              <TableHead>পরিমাণ</TableHead>
                              <TableHead>মাস</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feePayments?.map((p: any) => (
                              <TableRow key={p.id}>
                                <TableCell>{format(new Date(p.payment_date), 'dd MMM yyyy', { locale: bn })}</TableCell>
                                <TableCell>{p.fee_structures?.fee_type}</TableCell>
                                <TableCell className="font-semibold">৳{Number(p.amount).toLocaleString('bn-BD')}</TableCell>
                                <TableCell>{p.month} {p.year}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="results">
                    <Card>
                      <CardHeader><CardTitle>পরীক্ষার ফলাফল</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>পরীক্ষা</TableHead>
                              <TableHead>বিষয়</TableHead>
                              <TableHead>প্রাপ্ত নম্বর</TableHead>
                              <TableHead>গ্রেড</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {examResults?.map((r: any) => (
                              <TableRow key={r.id}>
                                <TableCell className="font-medium">{r.exams?.exam_name}</TableCell>
                                <TableCell>{r.exams?.subject}</TableCell>
                                <TableCell>
                                  {r.is_absent ? 'অনুপস্থিত' : `${r.marks_obtained}/${r.exams?.total_marks}`}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={r.marks_obtained >= (r.exams?.pass_marks || 0) ? 'default' : 'destructive'}>
                                    {r.grade || (r.marks_obtained >= (r.exams?.pass_marks || 0) ? 'পাস' : 'ফেল')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="homework">
                    <Card>
                      <CardHeader><CardTitle>বর্তমান হোমওয়ার্ক</CardTitle></CardHeader>
                      <CardContent>
                        {homework && homework.length > 0 ? (
                          <div className="space-y-4">
                            {homework.map((hw: any) => (
                              <Card key={hw.id}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{hw.title}</CardTitle>
                                    <Badge>{hw.subject}</Badge>
                                  </div>
                                  <CardDescription>
                                    জমার তারিখ: {format(new Date(hw.due_date), 'dd MMM yyyy', { locale: bn })}
                                  </CardDescription>
                                </CardHeader>
                                {hw.description && (
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground">{hw.description}</p>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">কোনো হোমওয়ার্ক নেই</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
