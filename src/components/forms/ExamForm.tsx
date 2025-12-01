import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateExam } from '@/hooks/useExams';
import { SUBJECTS } from '@/hooks/useTimetable';

const examSchema = z.object({
  exam_name: z.string().min(1, 'পরীক্ষার নাম দিন'),
  exam_type: z.string().min(1, 'পরীক্ষার ধরন নির্বাচন করুন'),
  department: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  class_name: z.string().min(1, 'শ্রেণী দিন'),
  subject: z.string().min(1, 'বিষয় নির্বাচন করুন'),
  total_marks: z.coerce.number().min(1, 'পূর্ণমান দিন'),
  pass_marks: z.coerce.number().min(1, 'পাশ নম্বর দিন'),
  exam_date: z.string().min(1, 'তারিখ দিন'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  academic_year: z.coerce.number().min(2020, 'শিক্ষাবর্ষ দিন'),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExamForm = ({ open, onOpenChange, onSuccess }: ExamFormProps) => {
  const createExam = useCreateExam();
  
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      exam_name: '',
      exam_type: 'সাময়িক',
      department: '',
      class_name: '',
      subject: '',
      total_marks: 100,
      pass_marks: 40,
      exam_date: '',
      start_time: '',
      end_time: '',
      academic_year: new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: ExamFormData) => {
    await createExam.mutateAsync({
      exam_name: data.exam_name,
      exam_type: data.exam_type,
      department: data.department,
      class_name: data.class_name,
      subject: data.subject,
      total_marks: data.total_marks,
      pass_marks: data.pass_marks,
      exam_date: data.exam_date,
      start_time: data.start_time || undefined,
      end_time: data.end_time || undefined,
      academic_year: data.academic_year,
      is_active: true,
    });
    form.reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন পরীক্ষা যোগ করুন</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exam_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরীক্ষার নাম *</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন: প্রথম সাময়িক পরীক্ষা" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exam_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরীক্ষার ধরন *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="সাময়িক">সাময়িক</SelectItem>
                        <SelectItem value="অর্ধ-বার্ষিক">অর্ধ-বার্ষিক</SelectItem>
                        <SelectItem value="বার্ষিক">বার্ষিক</SelectItem>
                        <SelectItem value="মডেল টেস্ট">মডেল টেস্ট</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিভাগ *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="মক্তব">মক্তব</SelectItem>
                        <SelectItem value="হিফজ">হিফজ</SelectItem>
                        <SelectItem value="কিতাব">কিতাব</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="class_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শ্রেণী *</FormLabel>
                    <FormControl>
                      <Input placeholder="শ্রেণীর নাম" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিষয় *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exam_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরীক্ষার তারিখ *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="total_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পূর্ণমান *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pass_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পাশ নম্বর *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শুরুর সময়</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শেষের সময়</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শিক্ষাবর্ষ *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={createExam.isPending}>
                {createExam.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamForm;
