import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

const expenseCategories: ExpenseCategory[] = [
  "বাজার",
  "বেতন",
  "বিদ্যুৎ",
  "পানি",
  "গ্যাস",
  "রক্ষণাবেক্ষণ",
  "অন্যান্য",
];

const itemSchema = z.object({
  title: z.string().min(1, "আইটেমের নাম দিন"),
  category: z.enum(expenseCategories as [ExpenseCategory, ...ExpenseCategory[]]),
  amount: z.coerce.number().min(1, "পরিমাণ দিন"),
  description: z.string().optional(),
});

const bulkExpenseSchema = z.object({
  batch_name: z.string().min(1, "বাজারের নাম দিন (যেমন: সাপ্তাহিক বাজার)"),
  expense_date: z.string().min(1, "তারিখ দিন"),
  items: z.array(itemSchema).min(1, "অন্তত একটি আইটেম যোগ করুন"),
});

type BulkExpenseFormData = z.infer<typeof bulkExpenseSchema>;

interface BulkExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkExpenseForm({ open, onOpenChange, onSuccess }: BulkExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<BulkExpenseFormData>({
    resolver: zodResolver(bulkExpenseSchema),
    defaultValues: {
      batch_name: "",
      expense_date: new Date().toISOString().split("T")[0],
      items: [{ title: "", category: "বাজার", amount: 0, description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const totalAmount = form.watch("items").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const onSubmit = async (data: BulkExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("লগইন করুন");
        return;
      }

      const batchId = crypto.randomUUID();
      
      const expenseRecords = data.items.map((item, index) => ({
        expense_id: `EXP-${Date.now()}-${index}`,
        title: item.title,
        category: item.category,
        amount: item.amount,
        description: item.description || null,
        expense_date: data.expense_date,
        batch_id: batchId,
        batch_name: data.batch_name,
        created_by: userData.user.id,
      }));

      const { error } = await supabase.from("expenses").insert(expenseRecords);

      if (error) throw error;

      toast.success(`${data.items.length}টি আইটেম সফলভাবে যোগ হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "সংরক্ষণ করা যায়নি");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({ title: "", category: "বাজার", amount: 0, description: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            বাজার খরচ (একাধিক আইটেম)
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batch_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বাজারের নাম</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন: সাপ্তাহিক বাজার, ঈদের বাজার" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>তারিখ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">আইটেম সমূহ</h4>

              {fields.map((field, index) => (
                <Card key={field.id} className="border-border/50">
                  <CardContent className="pt-4 pb-3">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">আইটেম</FormLabel>
                              <FormControl>
                                <Input placeholder="চাল, ডাল, তেল..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">ক্যাটাগরি</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {expenseCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">টাকা</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="০" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">বিবরণ</FormLabel>
                              <FormControl>
                                <Input placeholder="ঐচ্ছিক" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-7">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                নতুন আইটেম যোগ করুন
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-lg font-semibold">
                মোট: ৳{totalAmount.toLocaleString("bn-BD")}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "সংরক্ষণ হচ্ছে..." : `${fields.length}টি আইটেম সংরক্ষণ করুন`}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
