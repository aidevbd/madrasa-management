import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapDatabaseError } from '@/lib/database-errors';
import { Student } from '@/hooks/useStudents';

const studentSchema = z.object({
  student_id: z.string().min(1, 'আইডি প্রয়োজন').max(50, 'আইডি সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  father_name: z.string().max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
  mother_name: z.string().max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'সঠিক বাংলাদেশী ফোন নম্বর দিন').optional().or(z.literal('')),
  guardian_phone: z.string().regex(/^01[3-9]\d{8}$/, 'সঠিক বাংলাদেশী ফোন নম্বর দিন (০১xxxxxxxx)'),
  address: z.string().max(500, 'ঠিকানা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional(),
  department: z.enum(['মক্তব', 'হিফজ', 'কিতাব']),
  class_name: z.string().min(1, 'ক্লাস প্রয়োজন').max(50, 'ক্লাস সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
  admission_date: z.string().optional(),
  notes: z.string().max(2000, 'নোট সর্বোচ্চ ২০০০ অক্ষরের হতে পারে').optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Student | null;
}

export function StudentForm({ open, onOpenChange, onSuccess, editData }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const selectedDepartment = watch('department');

  useEffect(() => {
    if (editData) {
      setValue('student_id', editData.student_id);
      setValue('name', editData.name);
      setValue('father_name', editData.father_name || '');
      setValue('mother_name', editData.mother_name || '');
      setValue('date_of_birth', editData.date_of_birth || '');
      setValue('phone', editData.phone || '');
      setValue('guardian_phone', editData.guardian_phone);
      setValue('address', editData.address || '');
      setValue('department', editData.department);
      setValue('class_name', editData.class_name);
      setValue('admission_date', editData.admission_date || '');
      setValue('notes', editData.notes || '');
    } else {
      reset();
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনি লগইন করা নেই');
        return;
      }

      const studentData = {
        student_id: data.student_id,
        name: data.name,
        father_name: data.father_name || null,
        mother_name: data.mother_name || null,
        date_of_birth: data.date_of_birth || null,
        phone: data.phone || null,
        guardian_phone: data.guardian_phone,
        address: data.address || null,
        department: data.department,
        class_name: data.class_name,
        admission_date: data.admission_date || new Date().toISOString().split('T')[0],
        notes: data.notes || null,
      };

      if (isEditing) {
        const { error } = await supabase.from('students')
          .update(studentData)
          .eq('id', editData.id);
        if (error) throw error;
        toast.success('ছাত্র তথ্য আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('students').insert({
          ...studentData,
          created_by: user.id,
        });
        if (error) throw error;
        toast.success('ছাত্র সফলভাবে যুক্ত হয়েছে');
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(mapDatabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'ছাত্র তথ্য সম্পাদনা' : 'নতুন ছাত্র যুক্ত করুন'}</DialogTitle>
          <DialogDescription>ছাত্রের সকল তথ্য পূরণ করুন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">ছাত্র আইডি *</Label>
              <Input id="student_id" {...register('student_id')} placeholder="ST001" disabled={isEditing} />
              {errors.student_id && <p className="text-sm text-destructive">{errors.student_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">নাম *</Label>
              <Input id="name" {...register('name')} placeholder="ছাত্রের নাম" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="father_name">পিতার নাম</Label>
              <Input id="father_name" {...register('father_name')} placeholder="পিতার নাম" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mother_name">মাতার নাম</Label>
              <Input id="mother_name" {...register('mother_name')} placeholder="মাতার নাম" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">জন্ম তারিখ</Label>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission_date">ভর্তির তারিখ</Label>
              <Input id="admission_date" type="date" {...register('admission_date')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">ছাত্রের ফোন</Label>
              <Input id="phone" {...register('phone')} placeholder="০১৭xxxxxxxx" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardian_phone">অভিভাবকের ফোন *</Label>
              <Input id="guardian_phone" {...register('guardian_phone')} placeholder="০১৭xxxxxxxx" />
              {errors.guardian_phone && <p className="text-sm text-destructive">{errors.guardian_phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">বিভাগ *</Label>
              <Select value={selectedDepartment} onValueChange={(value) => setValue('department', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="মক্তব">মক্তব</SelectItem>
                  <SelectItem value="হিফজ">হিফজ</SelectItem>
                  <SelectItem value="কিতাব">কিতাব</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_name">ক্লাস/গ্রুপ *</Label>
              <Input id="class_name" {...register('class_name')} placeholder="ক্লাস/গ্রুপ" />
              {errors.class_name && <p className="text-sm text-destructive">{errors.class_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">ঠিকানা</Label>
            <Textarea id="address" {...register('address')} placeholder="সম্পূর্ণ ঠিকানা" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">নোট</Label>
            <Textarea id="notes" {...register('notes')} placeholder="অতিরিক্ত তথ্য" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditing ? 'আপডেট হচ্ছে...' : 'যুক্ত হচ্ছে...') : (isEditing ? 'আপডেট করুন' : 'যুক্ত করুন')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
