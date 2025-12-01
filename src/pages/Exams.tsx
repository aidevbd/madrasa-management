import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText, GraduationCap, ClipboardList, Download } from 'lucide-react';
import { useExams, useExamResults, Exam } from '@/hooks/useExams';
import { useStudents } from '@/hooks/useStudents';
import ExamForm from '@/components/forms/ExamForm';
import ExamResultsForm from '@/components/forms/ExamResultsForm';
import { generateStudentReportCard, downloadPDF } from '@/lib/pdf-generator';

const Exams = () => {
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isResultsFormOpen, setIsResultsFormOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: examResults, isLoading: resultsLoading } = useExamResults(selectedExam?.id);
  const { data: students } = useStudents();

  const filteredExams = exams?.filter(exam => {
    const matchesSearch = exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || exam.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleAddResults = (exam: Exam) => {
    setSelectedExam(exam);
    setIsResultsFormOpen(true);
  };

  const handleViewResults = (exam: Exam) => {
    setSelectedExam(exam);
  };

  const handleDownloadReportCard = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    const studentResults = examResults?.filter(r => r.student_id === studentId) || [];
    
    if (student && studentResults.length > 0) {
      const resultsData = studentResults.map(r => ({
        subject: r.exam?.subject || '',
        total_marks: r.exam?.total_marks || 100,
        marks_obtained: r.marks_obtained,
        grade: r.grade || 'N/A',
      }));
      
      const pdf = generateStudentReportCard(
        {
          name: student.name,
          student_id: student.student_id,
          class_name: student.class_name,
          department: student.department,
          father_name: student.father_name || undefined,
          mother_name: student.mother_name || undefined,
        },
        resultsData,
        selectedExam?.exam_name || 'Exam',
        selectedExam?.academic_year || new Date().getFullYear()
      );
      
      downloadPDF(pdf, `report-card-${student.student_id}`);
    }
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A+': return 'default';
      case 'A':
      case 'A-': return 'secondary';
      case 'B':
      case 'C': return 'outline';
      default: return 'destructive';
    }
  };

  if (examsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">পরীক্ষা ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground">পরীক্ষা, ফলাফল ও মার্কশিট পরিচালনা</p>
          </div>
          <Button onClick={() => setIsExamFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> নতুন পরীক্ষা
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">মোট পরীক্ষা</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exams?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">সাময়িক পরীক্ষা</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams?.filter(e => e.exam_type === 'সাময়িক').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">বার্ষিক পরীক্ষা</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams?.filter(e => e.exam_type === 'বার্ষিক').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">এই বছর</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {exams?.filter(e => e.academic_year === new Date().getFullYear()).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="exams" className="space-y-4">
          <TabsList>
            <TabsTrigger value="exams">পরীক্ষা তালিকা</TabsTrigger>
            <TabsTrigger value="results">ফলাফল</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="পরীক্ষা খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="বিভাগ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বিভাগ</SelectItem>
                  <SelectItem value="মক্তব">মক্তব</SelectItem>
                  <SelectItem value="হিফজ">হিফজ</SelectItem>
                  <SelectItem value="কিতাব">কিতাব</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exams Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>পরীক্ষার নাম</TableHead>
                      <TableHead>বিষয়</TableHead>
                      <TableHead>বিভাগ</TableHead>
                      <TableHead>শ্রেণী</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>পূর্ণমান</TableHead>
                      <TableHead>পাশ নম্বর</TableHead>
                      <TableHead className="text-right">একশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams?.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.exam_name}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.department}</Badge>
                        </TableCell>
                        <TableCell>{exam.class_name}</TableCell>
                        <TableCell>{new Date(exam.exam_date).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>{exam.pass_marks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddResults(exam)}
                            >
                              ফলাফল দিন
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewResults(exam)}
                            >
                              দেখুন
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!filteredExams || filteredExams.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          কোনো পরীক্ষা পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {/* Exam Selection for Results */}
            <div className="flex gap-4">
              <Select
                value={selectedExam?.id || ''}
                onValueChange={(id) => setSelectedExam(exams?.find(e => e.id === id) || null)}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.exam_name} - {exam.subject} ({exam.class_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExam && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedExam.exam_name} - {selectedExam.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  {resultsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>আইডি</TableHead>
                          <TableHead>নাম</TableHead>
                          <TableHead>প্রাপ্ত নম্বর</TableHead>
                          <TableHead>গ্রেড</TableHead>
                          <TableHead>মন্তব্য</TableHead>
                          <TableHead className="text-right">একশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examResults?.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.student?.student_id}</TableCell>
                            <TableCell className="font-medium">{result.student?.name}</TableCell>
                            <TableCell>
                              {result.is_absent ? 'অনুপস্থিত' : result.marks_obtained}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getGradeBadgeVariant(result.grade || 'F')}>
                                {result.grade || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>{result.remarks || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReportCard(result.student_id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!examResults || examResults.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              এই পরীক্ষার কোনো ফলাফল নেই
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Forms */}
      <ExamForm
        open={isExamFormOpen}
        onOpenChange={setIsExamFormOpen}
        onSuccess={() => setIsExamFormOpen(false)}
      />
      
      {selectedExam && (
        <ExamResultsForm
          open={isResultsFormOpen}
          onOpenChange={setIsResultsFormOpen}
          exam={selectedExam}
          onSuccess={() => setIsResultsFormOpen(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Exams;
