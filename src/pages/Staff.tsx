import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaff, useStaffStats, useDeleteStaff, type Staff as StaffType } from "@/hooks/useStaff";
import { StaffForm } from "@/components/forms/StaffForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [viewingStaff, setViewingStaff] = useState<StaffType | null>(null);
  const { data: staff, isLoading, refetch } = useStaff();
  const deleteStaff = useDeleteStaff();
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

  const handleDelete = (id: string) => {
    deleteStaff.mutate(id, {
      onSuccess: () => {
        toast.success('স্টাফ মুছে ফেলা হয়েছে');
        refetch();
      },
      onError: () => toast.error('স্টাফ মুছতে সমস্যা হয়েছে')
    });
  };

  const handleEdit = (staffMember: StaffType) => {
    setEditingStaff(staffMember);
    setIsFormOpen(true);
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
                <TableCell className="text-right whitespace-nowrap space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setViewingStaff(staffMember)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(staffMember)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>স্টাফ মুছে ফেলুন?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{staffMember.name}" কে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(staffMember.id)}>মুছুন</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
          <Button className="flex-1 sm:flex-none" onClick={() => { setEditingStaff(null); setIsFormOpen(true); }}>
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

      {/* Staff Detail Dialog */}
      <Dialog open={!!viewingStaff} onOpenChange={() => setViewingStaff(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>স্টাফের বিস্তারিত তথ্য</DialogTitle>
            <DialogDescription>সম্পূর্ণ প্রোফাইল</DialogDescription>
          </DialogHeader>
          {viewingStaff && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {viewingStaff.photo_url ? (
                  <img src={viewingStaff.photo_url} alt={viewingStaff.name} className="w-24 h-24 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {viewingStaff.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{viewingStaff.name}</h3>
                  <p className="text-muted-foreground">{viewingStaff.designation}</p>
                  <p className="text-sm text-muted-foreground">আইডি: {viewingStaff.staff_id}</p>
                  <Badge className="mt-2">{viewingStaff.status}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">মোবাইল</Label>
                  <p className="font-medium font-mono">{viewingStaff.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">ইমেইল</Label>
                  <p className="font-medium">{viewingStaff.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">বেতন</Label>
                  <p className="font-medium">৳{formatCurrency(viewingStaff.salary)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">যোগদানের তারিখ</Label>
                  <p className="font-medium">
                    {viewingStaff.join_date ? format(new Date(viewingStaff.join_date), 'dd MMM yyyy', { locale: bn }) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">এনআইডি</Label>
                  <p className="font-medium font-mono">{viewingStaff.nid || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">শিক্ষাগত যোগ্যতা</Label>
                  <p className="font-medium">{viewingStaff.education || '-'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-xs">ঠিকানা</Label>
                  <p className="font-medium">{viewingStaff.address || '-'}</p>
                </div>
                {viewingStaff.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground text-xs">নোট</Label>
                    <p className="font-medium">{viewingStaff.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setViewingStaff(null); handleEdit(viewingStaff); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  সম্পাদনা
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StaffForm 
        open={isFormOpen} 
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingStaff(null); }} 
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
          setEditingStaff(null);
        }}
        editData={editingStaff}
      />
    </div>
  );
}
