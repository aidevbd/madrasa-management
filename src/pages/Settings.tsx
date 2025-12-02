import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("প্রোফাইল আপডেট সফল হয়েছে");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">সেটিংস</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>প্রোফাইল তথ্য</CardTitle>
            <CardDescription>আপনার ব্যক্তিগত তথ্য আপডেট করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">পূর্ণ নাম</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">ফোন নম্বর</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="আপনার ফোন নম্বর লিখুন"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>অ্যাকাউন্ট তথ্য</CardTitle>
            <CardDescription>আপনার অ্যাকাউন্ট সম্পর্কিত তথ্য</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">ইউজার আইডি</span>
              <span className="text-sm font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">অ্যাকাউন্ট তৈরির তারিখ</span>
              <span className="text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("bn-BD") : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সিস্টেম ইনফরমেশন</CardTitle>
            <CardDescription>মাদরাসা ম্যানেজমেন্ট সিস্টেম</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">সংস্করণ</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">শেষ আপডেট</span>
              <span className="text-sm">২০২৫</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
