import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Calendar, Search, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff } from "@/hooks/useStaff";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Homework {
  id: string;
  title: string;
  description: string | null;
  department: string;
  class_name: string;
  subject: string;
  teacher_id: string | null;
  assigned_date: string;
  due_date: string;
  is_active: boolean;
  staff?: { name: string } | null;
}

const departments = ['মক্তব', 'হিফজ', 'কিতাব'];
const subjects = ['কুরআন', 'হাদিস', 'ফিকহ', 'আরবি', 'বাংলা', 'গণিত', 'ইংরেজি', 'অন্যান্য'];

export default function Homework() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<Homework | null>(null);
  const [editing, setEditing] = useState<Homework | null>(null);
  const { data: staff } = useStaff();

  const [form, setForm] = useState({
    title: '',
    description: '',
    department: 'মক্তব',
    class_name: '',
    subject: 'কুরআন',
    teacher_id: '',
    due_date: ''
  });

  const { data: homework, isLoading } = useQuery({
    queryKey: ['homework'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('*, staff(name)')
        .eq('is_active', true)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Homework[];
    }
  });

  const createHomework = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('homework').insert([{
        ...data,
        teacher_id: data.teacher_id || null,
        assigned_date: new Date().toISOString().split('T')[0]
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('হোমওয়ার্ক যোগ করা হয়েছে');
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error('হোমওয়ার্ক যোগ করতে সমস্যা হয়েছে')
  });

  const updateHomework = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof form) => {
      const { error } = await supabase.from('homework').update({
        ...data,
        teacher_id: data.teacher_id || null
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('হোমওয়ার্ক আপডেট হয়েছে');
      setDialogOpen(false);
      setEditing(null);
      resetForm();
    },
    onError: () => toast.error('হোমওয়ার্ক আপডেট করতে সমস্যা হয়েছে')
  });

  const deleteHomework = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('homework').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('হোমওয়ার্ক মুছে ফেলা হয়েছে');
    },
    onError: () => toast.error('হোমওয়ার্ক মুছতে সমস্যা হয়েছে')
  });

  const resetForm = () => {
    setForm({ title: '', description: '', department: 'মক্তব', class_name: '', subject: 'কুরআন', teacher_id: '', due_date: '' });
  };

  const handleEdit = (hw: Homework) => {
    setEditing(hw);
    setForm({
      title: hw.title,
      description: hw.description || '',
      department: hw.department,
      class_name: hw.class_name,
      subject: hw.subject,
      teacher_id: hw.teacher_id || '',
      due_date: hw.due_date
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.class_name || !form.due_date) {
      toast.error('সব প্রয়োজনীয় তথ্য দিন');
      return;
    }
    if (editing) {
      updateHomework.mutate({ id: editing.id, ...form });
    } else {
      createHomework.mutate(form);
    }
  };

  const filteredHomework = homework?.filter(hw =>
    hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isOverdue = (date: string) => new Date(date) < new Date();
  const isDueSoon = (date: string) => {
    const due = new Date(date);
    const today = new Date();
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 2;
  };

  const teachers = staff?.filter(s => 
    s.designation.includes('শিক্ষক') || 
    s.designation.includes('উস্তাদ') || 
    s.designation.includes('মাওলানা')
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">হোমওয়ার্ক/অ্যাসাইনমেন্ট</h1>
          <p className="text-muted-foreground mt-1">ছাত্রদের জন্য হোমওয়ার্ক ও অ্যাসাইনমেন্ট</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditing(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />নতুন হোমওয়ার্ক</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'হোমওয়ার্ক সম্পাদনা' : 'নতুন হোমওয়ার্ক'}</DialogTitle>
              <DialogDescription>হোমওয়ার্কের তথ্য দিন</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label>শিরোনাম *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="হোমওয়ার্কের শিরোনাম" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>বিভাগ</Label>
                  <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>শ্রেণি *</Label>
                  <Input value={form.class_name} onChange={e => setForm({...form, class_name: e.target.value})} placeholder="শ্রেণি" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>বিষয়</Label>
                  <Select value={form.subject} onValueChange={v => setForm({...form, subject: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>জমা দেওয়ার তারিখ *</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>শিক্ষক</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm({...form, teacher_id: v})}>
                  <SelectTrigger><SelectValue placeholder="শিক্ষক নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>বিবরণ</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="হোমওয়ার্কের বিস্তারিত..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>{editing ? 'আপডেট করুন' : 'যোগ করুন'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মোট হোমওয়ার্ক</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              {homework?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>শীঘ্রই জমা দিতে হবে</CardDescription>
            <CardTitle className="text-3xl text-orange-500">
              {homework?.filter(h => isDueSoon(h.due_date)).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মেয়াদ উত্তীর্ণ</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {homework?.filter(h => isOverdue(h.due_date)).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="শিরোনাম, শ্রেণি, বিষয় দিয়ে সার্চ করুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>শিরোনাম</TableHead>
                <TableHead className="hidden md:table-cell">বিভাগ</TableHead>
                <TableHead>শ্রেণি</TableHead>
                <TableHead className="hidden sm:table-cell">বিষয়</TableHead>
                <TableHead>জমার তারিখ</TableHead>
                <TableHead className="text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHomework.map(hw => (
                <TableRow key={hw.id}>
                  <TableCell className="font-medium">{hw.title}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline">{hw.department}</Badge></TableCell>
                  <TableCell>{hw.class_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{hw.subject}</TableCell>
                  <TableCell>
                    <Badge className={isOverdue(hw.due_date) ? 'bg-destructive' : isDueSoon(hw.due_date) ? 'bg-orange-500' : 'bg-success'}>
                      {format(new Date(hw.due_date), 'dd MMM yyyy', { locale: bn })}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setDetailDialog(hw)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(hw)}>
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
                          <AlertDialogTitle>হোমওয়ার্ক মুছে ফেলুন?</AlertDialogTitle>
                          <AlertDialogDescription>এই হোমওয়ার্কটি মুছে ফেলা হবে।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteHomework.mutate(hw.id)}>মুছুন</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailDialog?.title}</DialogTitle>
            <DialogDescription>হোমওয়ার্কের বিস্তারিত</DialogDescription>
          </DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">বিভাগ</Label><p>{detailDialog.department}</p></div>
                <div><Label className="text-muted-foreground">শ্রেণি</Label><p>{detailDialog.class_name}</p></div>
                <div><Label className="text-muted-foreground">বিষয়</Label><p>{detailDialog.subject}</p></div>
                <div><Label className="text-muted-foreground">শিক্ষক</Label><p>{detailDialog.staff?.name || 'নির্ধারিত নেই'}</p></div>
                <div><Label className="text-muted-foreground">দেওয়ার তারিখ</Label><p>{format(new Date(detailDialog.assigned_date), 'dd MMM yyyy', { locale: bn })}</p></div>
                <div><Label className="text-muted-foreground">জমার তারিখ</Label><p>{format(new Date(detailDialog.due_date), 'dd MMM yyyy', { locale: bn })}</p></div>
              </div>
              {detailDialog.description && (
                <div>
                  <Label className="text-muted-foreground">বিবরণ</Label>
                  <p className="mt-1 whitespace-pre-wrap">{detailDialog.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
