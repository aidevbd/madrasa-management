import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentForm } from "@/components/forms/DocumentForm";

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    forms: 0,
    reports: 0,
    policies: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      
      // Calculate stats based on actual data
      const reportsCount = data?.filter(d => d.category === 'রিপোর্ট').length || 0;
      const policiesCount = data?.filter(d => d.category === 'নীতিমালা').length || 0;
      const formsCount = data?.filter(d => d.category === 'ফর্ম').length || 0;
      
      setStats({
        total: data?.length || 0,
        forms: formsCount,
        reports: reportsCount,
        policies: policiesCount,
      });
    } catch (error) {
      toast.error('ডকুমেন্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ডকুমেন্ট ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">সকল গুরুত্বপূর্ণ ডকুমেন্ট ও ফাইল</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          নতুন ফাইল আপলোড করুন
        </Button>
      </div>

      {/* Document Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">মোট ডকুমেন্ট</CardDescription>
            <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">ফর্ম</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-primary">{stats.forms}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">রিপোর্ট</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-success">{stats.reports}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-4 md:p-6">
            <CardDescription className="text-xs md:text-sm">নীতিমালা</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-accent-foreground">{stats.policies}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ডকুমেন্ট নাম বা ক্যাটাগরি দিয়ে সার্চ করুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchTerm ? 'কোন ডকুমেন্ট পাওয়া যায়নি' : 'এখনও কোন ডকুমেন্ট আপলোড করা হয়নি'}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm md:text-base mb-2 line-clamp-2">{doc.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      {doc.file_size && (
                        <>
                          <span>•</span>
                          <span>{(Number(doc.file_size) / 1024 / 1024).toFixed(2)} MB</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(doc.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">দেখুন</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">ডাউনলোড</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DocumentForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => {
          fetchDocuments();
          setIsFormOpen(false);
        }} 
      />
    </div>
  );
}
