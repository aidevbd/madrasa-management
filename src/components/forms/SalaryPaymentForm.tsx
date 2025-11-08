import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateSalaryPayment } from "@/hooks/useSalaryPayments";

const formSchema = z.object({
  staff_id: z.string().min(1, "স্টাফ নির্বাচন করুন"),
  month: z.string().min(1, "মাস নির্বাচন করুন"),
  year: z.number().min(2020, "সঠিক বছর দিন"),
  amount: z.number().min(0, "পরিমাণ ০ এর বেশি হতে হবে"),
  payment_date: z.date(),
  payment_method: z.string().default("নগদ"),
  status: z.string().default("পরিশোধিত"),
  notes: z.string().optional(),
});

interface SalaryPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{ id: string; name: string; staff_id: string; salary: number | null }>;
  selectedStaffId?: string;
}

const months = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function SalaryPaymentForm({ open, onOpenChange, staff, selectedStaffId }: SalaryPaymentFormProps) {
  const createPayment = useCreateSalaryPayment();
  const [selectedStaff, setSelectedStaff] = useState<string>(selectedStaffId || "");

  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staff_id: selectedStaffId || "",
      month: currentMonth,
      year: currentYear,
      amount: 0,
      payment_date: new Date(),
      payment_method: "নগদ",
      status: "পরিশোধিত",
      notes: "",
    },
  });

  const onStaffChange = (staffId: string) => {
    setSelectedStaff(staffId);
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember?.salary) {
      form.setValue("amount", Number(staffMember.salary));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const paymentId = `SAL-${Date.now()}`;
    await createPayment.mutateAsync({
      payment_id: paymentId,
      staff_id: values.staff_id,
      month: values.month,
      year: values.year,
      amount: values.amount,
      payment_date: format(values.payment_date, "yyyy-MM-dd"),
      payment_method: values.payment_method,
      status: values.status,
      notes: values.notes || null,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>বেতন প্রদান</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staff_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>স্টাফ নির্বাচন করুন *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onStaffChange(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="স্টাফ নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.staff_id}) - ৳{s.salary || 0}
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
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>মাস *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="মাস নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বছর *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরিমাণ (৳) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
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
                    <FormLabel>প্রদানের তারিখ *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>তারিখ নির্বাচন করুন</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>প্রদান পদ্ধতি</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="নগদ">নগদ</SelectItem>
                        <SelectItem value="ব্যাংক">ব্যাংক</SelectItem>
                        <SelectItem value="মোবাইল ব্যাংকিং">মোবাইল ব্যাংকিং</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>স্ট্যাটাস</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="পরিশোধিত">পরিশোধিত</SelectItem>
                        <SelectItem value="অপরিশোধিত">অপরিশোধিত</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>নোট</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
