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
import { useCreateFeeStructure, useUpdateFeeStructure, FeeStructure } from "@/hooks/useFees";
import { Constants } from "@/integrations/supabase/types";

const formSchema = z.object({
  fee_type: z.string().min(1, "ফি টাইপ প্রয়োজন"),
  amount: z.string().min(1, "পরিমাণ প্রয়োজন"),
  frequency: z.string().min(1, "ফ্রিকোয়েন্সি প্রয়োজন"),
  department: z.string().optional(),
  class_name: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface FeeStructureFormProps {
  feeStructure?: FeeStructure;
  onSuccess?: () => void;
}

export function FeeStructureForm({ feeStructure, onSuccess }: FeeStructureFormProps) {
  const createMutation = useCreateFeeStructure();
  const updateMutation = useUpdateFeeStructure();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fee_type: feeStructure?.fee_type || "",
      amount: feeStructure?.amount?.toString() || "",
      frequency: feeStructure?.frequency || "মাসিক",
      department: feeStructure?.department || "",
      class_name: feeStructure?.class_name || "",
      description: feeStructure?.description || "",
      is_active: feeStructure?.is_active ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      amount: parseFloat(values.amount),
    };

    if (feeStructure) {
      await updateMutation.mutateAsync({ id: feeStructure.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }

    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fee_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ফি টাইপ</FormLabel>
              <FormControl>
                <Input placeholder="যেমন: মাসিক বেতন, বোর্ডিং ফি" {...field} />
              </FormControl>
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
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ফ্রিকোয়েন্সি</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="নির্বাচন করুন" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="মাসিক">মাসিক</SelectItem>
                  <SelectItem value="ত্রৈমাসিক">ত্রৈমাসিক</SelectItem>
                  <SelectItem value="বার্ষিক">বার্ষিক</SelectItem>
                  <SelectItem value="একবার">একবার</SelectItem>
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
              <FormLabel>বিভাগ (ঐচ্ছিক)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="সকল বিভাগ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">সকল বিভাগ</SelectItem>
                  {Constants.public.Enums.department_type.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
          name="class_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ক্লাস (ঐচ্ছিক)</FormLabel>
              <FormControl>
                <Input placeholder="নির্দিষ্ট ক্লাসের জন্য" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>বিবরণ (ঐচ্ছিক)</FormLabel>
              <FormControl>
                <Textarea placeholder="অতিরিক্ত তথ্য" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {feeStructure ? "আপডেট করুন" : "তৈরি করুন"}
        </Button>
      </form>
    </Form>
  );
}
