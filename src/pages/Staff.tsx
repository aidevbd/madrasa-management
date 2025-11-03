import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Filter, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaff, useStaffStats, Staff as StaffType } from "@/hooks/useStaff";
import { StaffForm } from "@/components/forms/StaffForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: staff, isLoading, refetch } = useStaff();
  const stats = useStaffStats(staff);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "০";
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  const teachers = staff?.filter(s => 
    s.designation.includes('শিক্ষক') || 
    s.designation.includes('উস্তাদ') || 
    s.designation.includes('মাওলানা')
  ) || [];

  const nonTeachers = staff?.filter(s => 
    !s.designation.includes('শিক্ষক') && 
    !s.designation.includes('উস্তাদ') && 
    !s.designation.includes('মাওলানা')
  ) || [];

  const filterStaff = (staffList: StaffType[]) => {
    if (!searchTerm) return staffList;
    const term = searchTerm.toLowerCase();
    return staffList.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.staff_id.toLowerCase().includes(term) ||
      s.designation.toLowerCase().includes(term) ||
      s.phone.includes(term)
    );
  };

  const exportToCSV = () => {
    if (!staff || staff.length === 0) {
      toast.error('কোন ডেটা নেই');
      return;
    }

    const headers = ['আইডি', 'নাম', 'পদবী', 'ফোন', 'বেতন', 'যোগদানের তারিখ'];
    const csvData = staff.map(s => [
      s.staff_id,
      s.name,
      s.designation,
      s.phone,
      s.salary || 0,
      s.join_date || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('ডেটা এক্সপোর্ট সফল হয়েছে');
  };

  const StaffTable = ({ data }: { data: StaffType[] }) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          কোনো স্টাফ পাওয়া যায়নি
        </div>
      );
    }

    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">আইডি</TableHead>
              <TableHead className="whitespace-nowrap">নাম</TableHead>
              <TableHead className="whitespace-nowrap hidden md:table-cell">পদবি</TableHead>
              <TableHead className="whitespace-nowrap hidden lg:table-cell">মোবাইল</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">বেতন (৳)</TableHead>
              <TableHead className="text-right whitespace-nowrap">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell className="font-medium whitespace-nowrap">{staffMember.staff_id}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{staffMember.name}</TableCell>
                <TableCell className="whitespace-nowrap hidden md:table-cell">{staffMember.designation}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap hidden lg:table-cell">{staffMember.phone}</TableCell>
                <TableCell className="font-semibold whitespace-nowrap hidden sm:table-cell">৳{formatCurrency(staffMember.salary)}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="sm">বিস্তারিত</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">স্টাফ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">শিক্ষক ও কর্মচারীদের তথ্য</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="flex-1 sm:flex-none" onClick={() => setIsFormOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">নতুন স্টাফ যুক্ত করুন</span>
            <span className="sm:hidden">নতুন স্টাফ</span>
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মোট স্টাফ</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>শিক্ষক</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.teachers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>অশিক্ষক কর্মচারী</CardDescription>
            <CardTitle className="text-3xl text-success">{stats.nonTeachers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="teachers" className="text-xs sm:text-sm">শিক্ষক স্টাফ</TabsTrigger>
          <TabsTrigger value="non-teachers" className="text-xs sm:text-sm">অশিক্ষক স্টাফ</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="নাম, আইডি, পদবি দিয়ে সার্চ করুন..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  ফিল্টার
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <StaffTable data={filterStaff(teachers)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-teachers">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="নাম, আইডি, পদবি দিয়ে সার্চ করুন..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  ফিল্টার
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <StaffTable data={filterStaff(nonTeachers)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StaffForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }} 
      />
    </div>
  );
}
