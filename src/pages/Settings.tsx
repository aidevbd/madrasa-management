import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, User, Shield, Database, Users } from "lucide-react";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

const ROLES = [
  { value: "admin", label: "অ্যাডমিন", description: "সম্পূর্ণ অ্যাক্সেস" },
  { value: "teacher", label: "শিক্ষক", description: "শিক্ষার্থী, পরীক্ষা, উপস্থিতি" },
  { value: "accountant", label: "অ্যাকাউন্ট্যান্ট", description: "ফি, বেতন, খরচ" },
  { value: "user", label: "সাধারণ ব্যবহারকারী", description: "শুধু দেখতে পারবেন" },
];

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Fetch all users with roles
  const { data: usersWithRoles = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, created_at");
      
      if (profilesError) throw profilesError;

      return profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        role: roles.find((r) => r.user_id === p.id)?.role || "user",
        created_at: p.created_at,
      })) as UserWithRole[];
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("প্রোফাইল আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as "admin" | "teacher" | "accountant" | "user",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("ভূমিকা পরিবর্তন হয়েছে");
    },
    onError: () => toast.error("পরিবর্তন করতে সমস্যা হয়েছে"),
  });

  type TableName = "students" | "staff" | "attendance" | "fee_payments" | "salary_payments" | "expenses" | "transactions";

  const exportData = async (tableName: TableName) => {
    try {
      toast.info(`${tableName} ডেটা এক্সপোর্ট হচ্ছে...`);
      const { data, error } = await supabase.from(tableName).select("*");
      
      if (error) throw error;
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableName}_${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${tableName} ডেটা এক্সপোর্ট সম্পন্ন`);
    } catch {
      toast.error("এক্সপোর্ট করতে সমস্যা হয়েছে");
    }
  };

  const exportAllData = async () => {
    const tables: TableName[] = ["students", "staff", "attendance", "fee_payments", "salary_payments", "expenses", "transactions"];
    for (const table of tables) {
      await exportData(table);
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (role) {
      case "admin": return "destructive";
      case "teacher": return "default";
      case "accountant": return "secondary";
      default: return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">সেটিংস</h1>
        <p className="text-muted-foreground mt-1 text-sm">অ্যাকাউন্ট ও সিস্টেম সেটিংস</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">প্রোফাইল</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">ভূমিকা</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">ব্যাকআপ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>প্রোফাইল তথ্য</CardTitle>
              <CardDescription>আপনার ব্যক্তিগত তথ্য আপডেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>নাম</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার নাম"
                />
              </div>
              <div className="space-y-2">
                <Label>ফোন</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ফোন নম্বর"
                />
              </div>
              <Button 
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending}
              >
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>অ্যাকাউন্ট তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">ইউজার আইডি</span>
                <span className="text-sm font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">তৈরির তারিখ</span>
                <span className="text-sm">
                  {user?.created_at ? format(new Date(user.created_at), "dd/MM/yyyy") : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                ব্যবহারকারী ভূমিকা ব্যবস্থাপনা
              </CardTitle>
              <CardDescription>ব্যবহারকারীদের ভূমিকা পরিবর্তন করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {ROLES.map((role) => (
                  <div key={role.value} className="p-3 rounded-lg border bg-card">
                    <Badge variant={getRoleBadgeVariant(role.value)} className="mb-2">{role.label}</Badge>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                ))}
              </div>

              {loadingUsers ? (
                <p className="text-muted-foreground">লোড হচ্ছে...</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>নাম</TableHead>
                        <TableHead>বর্তমান ভূমিকা</TableHead>
                        <TableHead>যোগদান</TableHead>
                        <TableHead>পরিবর্তন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersWithRoles.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(u.role)}>{getRoleLabel(u.role)}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(u.created_at), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(value) => updateRoleMutation.mutate({ userId: u.id, role: value })}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                ডেটা ব্যাকআপ ও এক্সপোর্ট
              </CardTitle>
              <CardDescription>আপনার ডেটা JSON ফরম্যাটে ডাউনলোড করুন</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" onClick={() => exportData("students")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>ছাত্র তথ্য</span>
                </Button>
                <Button variant="outline" onClick={() => exportData("staff")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>স্টাফ তথ্য</span>
                </Button>
                <Button variant="outline" onClick={() => exportData("attendance")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>উপস্থিতি</span>
                </Button>
                <Button variant="outline" onClick={() => exportData("fee_payments")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>ফি পেমেন্ট</span>
                </Button>
                <Button variant="outline" onClick={() => exportData("salary_payments")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>বেতন পেমেন্ট</span>
                </Button>
                <Button variant="outline" onClick={() => exportData("transactions")} className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span>লেনদেন</span>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button onClick={exportAllData} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  সব ডেটা এক্সপোর্ট করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
