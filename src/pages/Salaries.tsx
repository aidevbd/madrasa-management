import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { SalaryPaymentForm } from "@/components/forms/SalaryPaymentForm";
import { useSalaryPayments, useSalaryStats } from "@/hooks/useSalaryPayments";
import { useStaff } from "@/hooks/useStaff";
import { DollarSign, Users, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const months = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export default function Salaries() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState(months[new Date().getMonth()]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const { data: payments, isLoading: paymentsLoading } = useSalaryPayments();
  const { data: staff, isLoading: staffLoading } = useStaff();

  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const stats = useSalaryStats(payments, currentMonth, currentYear);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaySalary = (staffId: string) => {
    setSelectedStaffId(staffId);
    setIsFormOpen(true);
  };

  const filteredPayments = payments?.filter((payment) => {
    const matchesSearch =
      payment.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.staff.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = filterMonth === "সকল" || payment.month === filterMonth;
    const matchesYear = payment.year === filterYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  if (paymentsLoading || staffLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">বেতন ব্যবস্থাপনা</h1>
        <p className="text-muted-foreground">স্টাফদের বেতন প্রদান এবং রেকর্ড পরিচালনা করুন</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="এই মাসে প্রদান"
          value={formatCurrency(stats.totalPaidThisMonth)}
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="এই বছর প্রদান"
          value={formatCurrency(stats.totalPaidThisYear)}
          icon={Calendar}
          variant="default"
        />
        <StatCard
          title="বেতন প্রাপ্ত স্টাফ"
          value={stats.totalStaffPaid.toString()}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="অপরিশোধিত"
          value={stats.pendingPayments.toString()}
          icon={AlertCircle}
          variant="default"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="স্টাফ, আইডি বা পেমেন্ট আইডি অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="সকল">সকল মাস</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={filterYear.toString()} 
            onValueChange={(value) => setFilterYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          বেতন প্রদান করুন
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>পেমেন্ট আইডি</TableHead>
              <TableHead>স্টাফ নাম</TableHead>
              <TableHead>পদবী</TableHead>
              <TableHead>মাস</TableHead>
              <TableHead>বছর</TableHead>
              <TableHead>পরিমাণ</TableHead>
              <TableHead>প্রদানের তারিখ</TableHead>
              <TableHead>পদ্ধতি</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments && filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.payment_id}</TableCell>
                  <TableCell>
                    {payment.staff.name}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {payment.staff.staff_id}
                    </span>
                  </TableCell>
                  <TableCell>{payment.staff.designation}</TableCell>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{payment.year}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        payment.status === "পরিশোধিত"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  কোন বেতন প্রদানের রেকর্ড পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SalaryPaymentForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedStaffId(undefined);
        }}
        staff={staff || []}
        selectedStaffId={selectedStaffId}
      />
    </div>
  );
}
