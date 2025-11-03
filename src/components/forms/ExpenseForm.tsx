import { useState } from 'react';
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

const expenseSchema = z.object({
  expense_id: z.string().min(1, 'আইডি প্রয়োজন').max(50, 'আইডি সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
  title: z.string().min(2, 'শিরোনাম প্রয়োজন').max(100, 'শিরোনাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  category: z.enum(['বাজার', 'বেতন', 'বিদ্যুৎ', 'পানি', 'গ্যাস', 'রক্ষণাবেক্ষণ', 'অন্যান্য']),
  amount: z.string().min(1, 'পরিমাণ প্রয়োজন'),
  description: z.string().max(2000, 'বিবরণ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে').optional(),
  expense_date: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseForm({ open, onOpenChange, onSuccess }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনি লগইন করা নেই');
        return;
      }

      const { error } = await supabase.from('expenses').insert({
        expense_id: data.expense_id,
        title: data.title,
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description || null,
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        created_by: user.id,
      });

      if (error) throw error;

      toast.success('খরচ সফলভাবে যুক্ত হয়েছে');
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>নতুন খরচ যুক্ত করুন</DialogTitle>
          <DialogDescription>খরচের সকল তথ্য পূরণ করুন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_id">খরচ আইডি *</Label>
              <Input id="expense_id" {...register('expense_id')} placeholder="EXP001" />
              {errors.expense_id && <p className="text-sm text-destructive">{errors.expense_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">তারিখ</Label>
              <Input id="expense_date" type="date" {...register('expense_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">শিরোনাম *</Label>
            <Input id="title" {...register('title')} placeholder="খরচের বিবরণ" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">ক্যাটাগরি *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="বাজার">বাজার</SelectItem>
                  <SelectItem value="বেতন">বেতন</SelectItem>
                  <SelectItem value="বিদ্যুৎ">বিদ্যুৎ</SelectItem>
                  <SelectItem value="পানি">পানি</SelectItem>
                  <SelectItem value="গ্যাস">গ্যাস</SelectItem>
                  <SelectItem value="রক্ষণাবেক্ষণ">রক্ষণাবেক্ষণ</SelectItem>
                  <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">পরিমাণ (টাকা) *</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="১০০০" />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea id="description" {...register('description')} placeholder="অতিরিক্ত তথ্য" rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'যুক্ত হচ্ছে...' : 'যুক্ত করুন'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}