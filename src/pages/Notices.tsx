import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    thisMonth: 0,
    active: 0,
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      setNotices(data || []);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        total: data?.length || 0,
        urgent: data?.filter(n => n.priority === 'জরুরী').length || 0,
        thisMonth: data?.filter(n => new Date(n.publish_date) >= monthStart).length || 0,
        active: data?.filter(n => n.is_active).length || 0,
      });
    } catch (error) {
      toast.error('নোটিশ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const demoNotices = [
    { 
      id: 1, 
      title: "আগামীকাল সাপ্তাহিক ছুটি",
      description: "আগামীকাল শুক্রবার মাদ্রাসা বন্ধ থাকবে। সকল ছাত্র ও শিক্ষক অবগত হন।",
      date: "০৩ নভেম্বর ২০২৫",
      type: "সাধারণ",
      priority: "normal"
    },
    { 
      id: 2, 
      title: "মাসিক পরীক্ষার সময়সূচি প্রকাশ",
      description: "আগামী সপ্তাহে মাসিক পরীক্ষা অনুষ্ঠিত হবে। বিস্তারিত সময়সূচি নোটিশ বোর্ডে দেখুন।",
      date: "০২ নভেম্বর ২০২৫",
      type: "পরীক্ষা",
      priority: "high"
    },
    { 
      id: 3, 
      title: "নতুন শিক্ষক নিয়োগ",
      description: "মাদ্রাসায় নতুন কিতাব বিভাগের শিক্ষক নিয়োগ দেওয়া হয়েছে। সবাই স্বাগত জানান।",
      date: "০১ নভেম্বর ২০২৫",
      type: "প্রশাসনিক",
      priority: "normal"
    },
    { 
      id: 4, 
      title: "বোর্ডিং ফি জমার শেষ তারিখ",
      description: "এ মাসের বোর্ডিং ফি আগামী ১০ নভেম্বরের মধ্যে জমা দিতে হবে। বিলম্ব ফি প্রযোজ্য হবে।",
      date: "৩০ অক্টোবর ২০২৫",
      type: "আর্থিক",
      priority: "high"
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">নোটিশ ও বিজ্ঞপ্তি</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">সকল গুরুত্বপূর্ণ নোটিশ দেখুন</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          নতুন নোটিশ যুক্ত করুন
        </Button>
      </div>

      {/* Notice Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">মোট নোটিশ</CardDescription>
            <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">জরুরি</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-destructive">{stats.urgent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">এই মাসে</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-primary">{stats.thisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">সক্রিয়</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-success">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              এখনও কোন নোটিশ প্রকাশিত হয়নি
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => (
          <Card key={notice.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notice.priority === 'জরুরী' 
                          ? 'bg-destructive/10' 
                          : 'bg-primary/10'
                      }`}>
                        <Bell className={`w-5 h-5 md:w-6 md:h-6 ${
                          notice.priority === 'জরুরী' 
                            ? 'text-destructive' 
                            : 'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg mb-2">{notice.title}</CardTitle>
                        <CardDescription className="text-xs md:text-sm">{notice.content}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={`whitespace-nowrap text-xs ${
                        notice.priority === 'জরুরী' 
                          ? 'border-destructive text-destructive' 
                          : ''
                      }`}
                    >
                      {notice.priority || 'সাধারণ'}
                    </Badge>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(notice.publish_date)}</p>
                  </div>
              </div>
            </CardHeader>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}
