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

const documentSchema = z.object({
  title: z.string().min(1, "শিরোনাম প্রয়োজন").max(200, "শিরোনাম ২০০ অক্ষরের মধ্যে হতে হবে"),
  category: z.enum(["ফর্ম", "রিপোর্ট", "নীতিমালা", "অন্যান্য"], { required_error: "ক্যাটাগরি নির্বাচন করুন" }),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DocumentForm({ open, onOpenChange, onSuccess }: DocumentFormProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const onSubmit = async (data: DocumentFormData) => {
    if (!file) {
      toast.error('ফাইল নির্বাচন করুন');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('আপনাকে লগইন করতে হবে');
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          title: data.title,
          category: data.category,
          description: data.description || null,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success('ডকুমেন্ট সফলভাবে আপলোড হয়েছে');
      reset();
      setFile(null);
      onSuccess();
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast.error('ডকুমেন্ট আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন ডকুমেন্ট আপলোড করুন</DialogTitle>
          <DialogDescription>ডকুমেন্টের তথ্য এবং ফাইল নির্বাচন করুন</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">শিরোনাম *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="ডকুমেন্টের শিরোনাম"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">ক্যাটাগরি *</Label>
            <Select onValueChange={(value) => setValue("category", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ফর্ম">ফর্ম</SelectItem>
                <SelectItem value="রিপোর্ট">রিপোর্ট</SelectItem>
                <SelectItem value="নীতিমালা">নীতিমালা</SelectItem>
                <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="ডকুমেন্টের বিবরণ (ঐচ্ছিক)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">ফাইল নির্বাচন করুন *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                নির্বাচিত: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              সমর্থিত: PDF, Word, Excel, Image (সর্বোচ্চ 10MB)
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
              }}
              disabled={loading}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={loading || !file} className="flex-1">
              {loading ? "আপলোড হচ্ছে..." : "আপলোড করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
