import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeeStructureForm } from "@/components/forms/FeeStructureForm";
import { FeePaymentForm } from "@/components/forms/FeePaymentForm";
import { useFeeStructures, useFeePayments, useDeleteFeeStructure } from "@/hooks/useFees";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Fees() {
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: feeStructures, isLoading: structuresLoading } = useFeeStructures();
  const { data: feePayments, isLoading: paymentsLoading } = useFeePayments();
  const deleteMutation = useDeleteFeeStructure();

  const totalCollected = feePayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const thisMonthPayments = feePayments?.filter(
    p => new Date(p.payment_date).getMonth() === new Date().getMonth()
  ) || [];
  const thisMonthCollected = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ফি ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">ছাত্রদের ফি স্ট্রাকচার ও পেমেন্ট পরিচালনা করুন</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  ফি স্ট্রাকচার যুক্ত করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন ফি স্ট্রাকচার</DialogTitle>
                  <DialogDescription>
                    নতুন ফি টাইপ এবং পরিমাণ নির্ধারণ করুন
                  </DialogDescription>
                </DialogHeader>
                <FeeStructureForm onSuccess={() => setStructureDialogOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  পেমেন্ট রেকর্ড করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>ফি পেমেন্ট রেকর্ড</DialogTitle>
                  <DialogDescription>
                    ছাত্রের ফি পেমেন্ট রেকর্ড করুন
                  </DialogDescription>
                </DialogHeader>
                <FeePaymentForm onSuccess={() => setPaymentDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সংগৃহীত</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">সর্বমোট ফি সংগ্রহ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">এই মাসের সংগ্রহ</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{thisMonthCollected.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthPayments.length} টি পেমেন্ট
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় ফি স্ট্রাকচার</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feeStructures?.filter(fs => fs.is_active).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">মোট স্ট্রাকচার</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="structures" className="space-y-4">
          <TabsList>
            <TabsTrigger value="structures">ফি স্ট্রাকচার</TabsTrigger>
            <TabsTrigger value="payments">পেমেন্ট রেকর্ড</TabsTrigger>
          </TabsList>

          <TabsContent value="structures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ফি স্ট্রাকচার তালিকা</CardTitle>
                <CardDescription>সকল ফি টাইপ এবং পরিমাণ</CardDescription>
              </CardHeader>
              <CardContent>
                {structuresLoading ? (
                  <p>লোড হচ্ছে...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ফি টাইপ</TableHead>
                        <TableHead>পরিমাণ</TableHead>
                        <TableHead>ফ্রিকোয়েন্সি</TableHead>
                        <TableHead>বিভাগ/ক্লাস</TableHead>
                        <TableHead>অবস্থা</TableHead>
                        <TableHead>অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeStructures?.map((structure) => (
                        <TableRow key={structure.id}>
                          <TableCell className="font-medium">{structure.fee_type}</TableCell>
                          <TableCell>৳{structure.amount.toLocaleString()}</TableCell>
                          <TableCell>{structure.frequency}</TableCell>
                          <TableCell>
                            {structure.department || structure.class_name || "সকল"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={structure.is_active ? "default" : "secondary"}>
                              {structure.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  মুছুন
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>নিশ্চিত করুন</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    আপনি কি এই ফি স্ট্রাকচার মুছে ফেলতে চান?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(structure.id)}
                                  >
                                    মুছুন
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>পেমেন্ট রেকর্ড</CardTitle>
                <CardDescription>সকল ফি পেমেন্টের ইতিহাস</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <p>লোড হচ্ছে...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>তারিখ</TableHead>
                        <TableHead>ছাত্র</TableHead>
                        <TableHead>ফি টাইপ</TableHead>
                        <TableHead>পরিমাণ</TableHead>
                        <TableHead>মাধ্যম</TableHead>
                        <TableHead>রসিদ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feePayments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            {payment.students?.name} ({payment.students?.student_id})
                          </TableCell>
                          <TableCell>{payment.fee_structures?.fee_type}</TableCell>
                          <TableCell className="font-medium">
                            ৳{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>{payment.receipt_number || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
