import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRecordFeePayment, useFeeStructures } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";
import { format } from "date-fns";

const formSchema = z.object({
  student_id: z.string().min(1, "ছাত্র নির্বাচন করুন"),
  fee_structure_id: z.string().min(1, "ফি টাইপ নির্বাচন করুন"),
  amount: z.string().min(1, "পরিমাণ প্রয়োজন"),
  payment_date: z.string().min(1, "তারিখ প্রয়োজন"),
  payment_method: z.string().default("নগদ"),
  month: z.string().optional(),
  year: z.string().optional(),
  receipt_number: z.string().optional(),
  remarks: z.string().optional(),
});

interface FeePaymentFormProps {
  onSuccess?: () => void;
  preSelectedStudentId?: string;
}

export function FeePaymentForm({ onSuccess, preSelectedStudentId }: FeePaymentFormProps) {
  const recordPayment = useRecordFeePayment();
  const { data: students } = useStudents();
  const { data: feeStructures } = useFeeStructures();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: preSelectedStudentId || "",
      fee_structure_id: "",
      amount: "",
      payment_date: format(new Date(), "yyyy-MM-dd"),
      payment_method: "নগদ",
      month: "",
      year: new Date().getFullYear().toString(),
      receipt_number: "",
      remarks: "",
    },
  });

  const selectedFeeStructure = feeStructures?.find(
    (fs) => fs.id === form.watch("fee_structure_id")
  );

  // Auto-fill amount when fee structure is selected
  if (selectedFeeStructure && !form.getValues("amount")) {
    form.setValue("amount", selectedFeeStructure.amount.toString());
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await recordPayment.mutateAsync({
      ...values,
      amount: parseFloat(values.amount),
      year: values.year ? parseInt(values.year) : undefined,
    });

    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ছাত্র</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ছাত্র নির্বাচন করুন" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.student_id}) - {student.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fee_structure_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ফি টাইপ</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ফি টাইপ নির্বাচন করুন" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {feeStructures?.filter(fs => fs.is_active).map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>
                      {fs.fee_type} - ৳{fs.amount} ({fs.frequency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>পরিমাণ (টাকা)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>পেমেন্ট তারিখ</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>পেমেন্ট মাধ্যম</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="নগদ">নগদ</SelectItem>
                  <SelectItem value="বিকাশ">বিকাশ</SelectItem>
                  <SelectItem value="নগদ (মোবাইল)">নগদ (মোবাইল)</SelectItem>
                  <SelectItem value="রকেট">রকেট</SelectItem>
                  <SelectItem value="ব্যাংক">ব্যাংক</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>মাস (ঐচ্ছিক)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="মাস" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="জানুয়ারি">জানুয়ারি</SelectItem>
                    <SelectItem value="ফেব্রুয়ারি">ফেব্রুয়ারি</SelectItem>
                    <SelectItem value="মার্চ">মার্চ</SelectItem>
                    <SelectItem value="এপ্রিল">এপ্রিল</SelectItem>
                    <SelectItem value="মে">মে</SelectItem>
                    <SelectItem value="জুন">জুন</SelectItem>
                    <SelectItem value="জুলাই">জুলাই</SelectItem>
                    <SelectItem value="আগস্ট">আগস্ট</SelectItem>
                    <SelectItem value="সেপ্টেম্বর">সেপ্টেম্বর</SelectItem>
                    <SelectItem value="অক্টোবর">অক্টোবর</SelectItem>
                    <SelectItem value="নভেম্বর">নভেম্বর</SelectItem>
                    <SelectItem value="ডিসেম্বর">ডিসেম্বর</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>বছর (ঐচ্ছিক)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="২০২৫" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="receipt_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>রসিদ নম্বর (ঐচ্ছিক)</FormLabel>
              <FormControl>
                <Input placeholder="রসিদ নম্বর" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>মন্তব্য (ঐচ্ছিক)</FormLabel>
              <FormControl>
                <Textarea placeholder="অতিরিক্ত তথ্য" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          পেমেন্ট রেকর্ড করুন
        </Button>
      </form>
    </Form>
  );
}
