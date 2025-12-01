import { useEffect } from 'react';
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
import { useCreateTimetable, useUpdateTimetable, DAYS_OF_WEEK, SUBJECTS, Timetable } from '@/hooks/useTimetable';
import { useStaff } from '@/hooks/useStaff';

const timetableSchema = z.object({
  department: z.string().min(1, 'বিভাগ নির্বাচন করুন'),
  class_name: z.string().min(1, 'শ্রেণী দিন'),
  day_of_week: z.string().min(1, 'দিন নির্বাচন করুন'),
  subject: z.string().min(1, 'বিষয় নির্বাচন করুন'),
  teacher_id: z.string().optional(),
  start_time: z.string().min(1, 'শুরুর সময় দিন'),
  end_time: z.string().min(1, 'শেষের সময় দিন'),
  room_number: z.string().optional(),
});

type TimetableFormData = z.infer<typeof timetableSchema>;

interface TimetableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry?: Timetable | null;
  onSuccess: () => void;
}

const TimetableForm = ({ open, onOpenChange, editingEntry, onSuccess }: TimetableFormProps) => {
  const createTimetable = useCreateTimetable();
  const updateTimetable = useUpdateTimetable();
  const { data: staff } = useStaff();
  
  const teachers = staff?.filter(s => s.designation.includes('শিক্ষক') || s.designation.includes('উস্তাদ') || s.designation.includes('মুফতি')) || [];
  
  const form = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      department: '',
      class_name: '',
      day_of_week: '',
      subject: '',
      teacher_id: '',
      start_time: '',
      end_time: '',
      room_number: '',
    },
  });

  // Reset form when editing entry changes
  useEffect(() => {
    if (editingEntry) {
      form.reset({
        department: editingEntry.department,
        class_name: editingEntry.class_name,
        day_of_week: editingEntry.day_of_week,
        subject: editingEntry.subject,
        teacher_id: editingEntry.teacher_id || '',
        start_time: editingEntry.start_time.slice(0, 5),
        end_time: editingEntry.end_time.slice(0, 5),
        room_number: editingEntry.room_number || '',
      });
    } else {
      form.reset({
        department: '',
        class_name: '',
        day_of_week: '',
        subject: '',
        teacher_id: '',
        start_time: '',
        end_time: '',
        room_number: '',
      });
    }
  }, [editingEntry, form]);

  const onSubmit = async (data: TimetableFormData) => {
    const formData = {
      department: data.department,
      class_name: data.class_name,
      day_of_week: data.day_of_week,
      subject: data.subject,
      start_time: data.start_time,
      end_time: data.end_time,
      teacher_id: data.teacher_id || undefined,
      room_number: data.room_number || undefined,
      is_active: true,
    };

    if (editingEntry) {
      await updateTimetable.mutateAsync({ id: editingEntry.id, ...formData });
    } else {
      await createTimetable.mutateAsync(formData);
    }
    
    form.reset();
    onSuccess();
  };

  const isLoading = createTimetable.isPending || updateTimetable.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingEntry ? 'শিডিউল সম্পাদনা' : 'নতুন শিডিউল যোগ করুন'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিভাগ *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="বিভাগ" />
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
                      <Input placeholder="শ্রেণী" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>দিন *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="দিন নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.filter(d => d !== 'শুক্রবার').map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শিক্ষক</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="শিক্ষক নির্বাচন করুন (ঐচ্ছিক)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">নির্ধারিত নয়</SelectItem>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শুরুর সময় *</FormLabel>
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
                    <FormLabel>শেষের সময় *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="room_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>রুম নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="রুম নম্বর (ঐচ্ছিক)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TimetableForm;
