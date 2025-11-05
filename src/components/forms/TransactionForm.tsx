import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const transactionSchema = z.object({
  transaction_id: z.string().min(1, "লেনদেন আইডি প্রয়োজন"),
  title: z.string().min(1, "শিরোনাম প্রয়োজন"),
  type: z.enum(["আয়", "ব্যয়"], { required_error: "ধরন নির্বাচন করুন" }),
  category: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "সঠিক পরিমাণ লিখুন"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "তারিখ নির্বাচন করুন"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransactionForm({ open, onOpenChange, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString().split('T')[0],
    }
  });

  const type = watch("type");

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনাকে লগইন করতে হবে');
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          transaction_id: data.transaction_id,
          title: data.title,
          type: data.type,
          category: data.category,
          amount: parseFloat(data.amount),
          description: data.description || null,
          transaction_date: data.transaction_date,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('লেনদেন সফলভাবে যুক্ত হয়েছে');
      reset();
      onSuccess();
    } catch (error: any) {
      console.error('Transaction insert error:', error);
      toast.error('লেনদেন যুক্ত করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন লেনদেন যুক্ত করুন</DialogTitle>
          <DialogDescription>আয় বা ব্যয়ের তথ্য দিন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_id">লেনদেন আইডি *</Label>
              <Input
                id="transaction_id"
                {...register("transaction_id")}
                placeholder="যেমন: TRX-001"
              />
              {errors.transaction_id && (
                <p className="text-sm text-destructive">{errors.transaction_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">ধরন *</Label>
              <Select onValueChange={(value) => setValue("type", value as "আয়" | "ব্যয়")}>
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="আয়">আয়</SelectItem>
                  <SelectItem value="ব্যয়">ব্যয়</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">শিরোনাম *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="লেনদেনের শিরোনাম"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">ক্যাটাগরি *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {type === "আয়" ? (
                    <>
                      <SelectItem value="বোর্ডিং ফি">বোর্ডিং ফি</SelectItem>
                      <SelectItem value="ভর্তি ফি">ভর্তি ফি</SelectItem>
                      <SelectItem value="দান">দান</SelectItem>
                      <SelectItem value="অনুদান">অনুদান</SelectItem>
                      <SelectItem value="অন্যান্য আয়">অন্যান্য আয়</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="বাজার">বাজার</SelectItem>
                      <SelectItem value="বেতন">বেতন</SelectItem>
                      <SelectItem value="বিদ্যুৎ">বিদ্যুৎ</SelectItem>
                      <SelectItem value="পানি">পানি</SelectItem>
                      <SelectItem value="গ্যাস">গ্যাস</SelectItem>
                      <SelectItem value="রক্ষণাবেক্ষণ">রক্ষণাবেক্ষণ</SelectItem>
                      <SelectItem value="অন্যান্য ব্যয়">অন্যান্য ব্যয়</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">পরিমাণ (৳) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder="০.০০"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">তারিখ *</Label>
            <Input
              id="transaction_date"
              type="date"
              {...register("transaction_date")}
            />
            {errors.transaction_date && (
              <p className="text-sm text-destructive">{errors.transaction_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "যুক্ত হচ্ছে..." : "যুক্ত করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
