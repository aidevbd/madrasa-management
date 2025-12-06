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

const noticeSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন").max(200, "শিরোনাম ২০০ অক্ষরের মধ্যে হতে হবে"),
  content: z.string().min(1, "বিষয়বস্তু প্রয়োজন"),
  priority: z.enum(["সাধারণ", "গুরুত্বপূর্ণ", "জরুরী"], { required_error: "অগ্রাধিকার নির্বাচন করুন" }),
  publish_date: z.string().min(1, "প্রকাশের তারিখ প্রয়োজন"),
  expire_date: z.string().optional(),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface NoticeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NoticeForm({ open, onOpenChange, onSuccess }: NoticeFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      publish_date: new Date().toISOString().split('T')[0],
      priority: "সাধারণ",
    }
  });

  const onSubmit = async (data: NoticeFormData) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনাকে লগইন করতে হবে');
        return;
      }

      const { error } = await supabase
        .from('notices')
        .insert({
          title: data.title,
          content: data.content,
          priority: data.priority,
          publish_date: data.publish_date,
          expire_date: data.expire_date || null,
          is_active: true,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('নোটিশ সফলভাবে প্রকাশ করা হয়েছে');
      reset();
      onSuccess();
    } catch (error: any) {
      toast.error('নোটিশ প্রকাশ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন নোটিশ প্রকাশ করুন</DialogTitle>
          <DialogDescription>নোটিশের বিস্তারিত তথ্য দিন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">শিরোনাম *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="নোটিশের শিরোনাম"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">বিষয়বস্তু *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="নোটিশের বিস্তারিত বিষয়বস্তু লিখুন"
              rows={6}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">অগ্রাধিকার *</Label>
              <Select 
                defaultValue="সাধারণ"
                onValueChange={(value) => setValue("priority", value as "সাধারণ" | "গুরুত্বপূর্ণ" | "জরুরী")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                  <SelectItem value="গুরুত্বপূর্ণ">গুরুত্বপূর্ণ</SelectItem>
                  <SelectItem value="জরুরী">জরুরী</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publish_date">প্রকাশের তারিখ *</Label>
              <Input
                id="publish_date"
                type="date"
                {...register("publish_date")}
              />
              {errors.publish_date && (
                <p className="text-sm text-destructive">{errors.publish_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expire_date">মেয়াদ শেষ (ঐচ্ছিক)</Label>
              <Input
                id="expire_date"
                type="date"
                {...register("expire_date")}
              />
              {errors.expire_date && (
                <p className="text-sm text-destructive">{errors.expire_date.message}</p>
              )}
            </div>
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
              {loading ? "প্রকাশ হচ্ছে..." : "প্রকাশ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
