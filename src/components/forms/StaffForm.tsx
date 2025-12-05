import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapDatabaseError } from '@/lib/database-errors';
import { Staff } from '@/hooks/useStaff';

const staffSchema = z.object({
  staff_id: z.string().min(1, 'আইডি প্রয়োজন').max(50, 'আইডি সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  designation: z.string().min(2, 'পদবী প্রয়োজন').max(100, 'পদবী সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'সঠিক বাংলাদেশী ফোন নম্বর দিন (০১xxxxxxxx)'),
  email: z.string().email('সঠিক ইমেইল দিন').max(255, 'ইমেইল সর্বোচ্চ ২৫৫ অক্ষরের হতে পারে').optional().or(z.literal('')),
  address: z.string().max(500, 'ঠিকানা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional(),
  salary: z.string().optional(),
  join_date: z.string().optional(),
  nid: z.string().regex(/^\d{10,17}$/, 'সঠিক এনআইডি নম্বর দিন').optional().or(z.literal('')),
  education: z.string().max(200, 'শিক্ষাগত যোগ্যতা সর্বোচ্চ ২০০ অক্ষরের হতে পারে').optional(),
  notes: z.string().max(2000, 'নোট সর্বোচ্চ ২০০০ অক্ষরের হতে পারে').optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: Staff | null;
}

export function StaffForm({ open, onOpenChange, onSuccess, editData }: StaffFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
  });

  useEffect(() => {
    if (editData) {
      setValue('staff_id', editData.staff_id);
      setValue('name', editData.name);
      setValue('designation', editData.designation);
      setValue('phone', editData.phone);
      setValue('email', editData.email || '');
      setValue('address', editData.address || '');
      setValue('salary', editData.salary?.toString() || '');
      setValue('join_date', editData.join_date || '');
      setValue('nid', editData.nid || '');
      setValue('education', editData.education || '');
      setValue('notes', editData.notes || '');
    } else {
      reset();
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: StaffFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনি লগইন করা নেই');
        return;
      }

      const staffData = {
        staff_id: data.staff_id,
        name: data.name,
        designation: data.designation,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        join_date: data.join_date || new Date().toISOString().split('T')[0],
        nid: data.nid || null,
        education: data.education || null,
        notes: data.notes || null,
      };

      if (isEditing) {
        const { error } = await supabase.from('staff')
          .update(staffData)
          .eq('id', editData.id);
        if (error) throw error;
        toast.success('স্টাফ তথ্য আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('staff').insert({
          ...staffData,
          created_by: user.id,
        });
        if (error) throw error;
        toast.success('স্টাফ সফলভাবে যুক্ত হয়েছে');
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
          <DialogTitle>{isEditing ? 'স্টাফ তথ্য সম্পাদনা' : 'নতুন স্টাফ যুক্ত করুন'}</DialogTitle>
          <DialogDescription>স্টাফের সকল তথ্য পূরণ করুন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff_id">স্টাফ আইডি *</Label>
              <Input id="staff_id" {...register('staff_id')} placeholder="STF001" disabled={isEditing} />
              {errors.staff_id && <p className="text-sm text-destructive">{errors.staff_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">নাম *</Label>
              <Input id="name" {...register('name')} placeholder="স্টাফের নাম" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">পদবী *</Label>
              <Input id="designation" {...register('designation')} placeholder="শিক্ষক/কর্মচারী" />
              {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর *</Label>
              <Input id="phone" {...register('phone')} placeholder="০১৭xxxxxxxx" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nid">জাতীয় পরিচয়পত্র নং</Label>
              <Input id="nid" {...register('nid')} placeholder="NID" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">বেতন (টাকা)</Label>
              <Input id="salary" type="number" {...register('salary')} placeholder="১০০০০" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="join_date">যোগদানের তারিখ</Label>
              <Input id="join_date" type="date" {...register('join_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">শিক্ষাগত যোগ্যতা</Label>
            <Input id="education" {...register('education')} placeholder="উচ্চ মাধ্যমিক/স্নাতক" />
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
