import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBulkAddExamResults, Exam, calculateGrade } from '@/hooks/useExams';
import { useStudents } from '@/hooks/useStudents';
import { toast } from 'sonner';

interface ExamResultsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam;
  onSuccess: () => void;
}

interface StudentResult {
  student_id: string;
  marks_obtained: number;
  is_absent: boolean;
  remarks: string;
}

const ExamResultsForm = ({ open, onOpenChange, exam, onSuccess }: ExamResultsFormProps) => {
  const { data: students } = useStudents();
  const bulkAddResults = useBulkAddExamResults();
  const [results, setResults] = useState<Record<string, StudentResult>>({});

  // Filter students by exam's department and class
  const eligibleStudents = students?.filter(
    s => s.department === exam.department && s.class_name === exam.class_name
  ) || [];

  // Initialize results when students load
  useEffect(() => {
    if (eligibleStudents.length > 0) {
      const initialResults: Record<string, StudentResult> = {};
      eligibleStudents.forEach(student => {
        if (!results[student.id]) {
          initialResults[student.id] = {
            student_id: student.id,
            marks_obtained: 0,
            is_absent: false,
            remarks: '',
          };
        }
      });
      if (Object.keys(initialResults).length > 0) {
        setResults(prev => ({ ...prev, ...initialResults }));
      }
    }
  }, [eligibleStudents.length]);

  const handleMarksChange = (studentId: string, marks: number) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: Math.min(marks, exam.total_marks),
        is_absent: false,
      },
    }));
  };

  const handleAbsentChange = (studentId: string, isAbsent: boolean) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        is_absent: isAbsent,
        marks_obtained: isAbsent ? 0 : prev[studentId]?.marks_obtained || 0,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSubmit = async () => {
    const resultsArray = Object.entries(results).map(([_, result]) => ({
      exam_id: exam.id,
      student_id: result.student_id,
      marks_obtained: result.marks_obtained,
      is_absent: result.is_absent,
      remarks: result.remarks || undefined,
    }));

    if (resultsArray.length === 0) {
      toast.error('কোনো ফলাফল নেই');
      return;
    }

    await bulkAddResults.mutateAsync(resultsArray);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            ফলাফল প্রদান - {exam.exam_name} ({exam.subject})
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {exam.department} - {exam.class_name} | পূর্ণমান: {exam.total_marks} | পাশ নম্বর: {exam.pass_marks}
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          {eligibleStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              এই শ্রেণীতে কোনো ছাত্র নেই
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">রোল</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead className="w-[100px]">নম্বর</TableHead>
                  <TableHead className="w-[80px]">গ্রেড</TableHead>
                  <TableHead className="w-[80px]">অনুপস্থিত</TableHead>
                  <TableHead>মন্তব্য</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleStudents.map((student) => {
                  const result = results[student.id];
                  const grade = result?.is_absent ? 'F' : calculateGrade(result?.marks_obtained || 0, exam.total_marks);
                  const isPassing = (result?.marks_obtained || 0) >= exam.pass_marks && !result?.is_absent;
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.student_id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={exam.total_marks}
                          value={result?.marks_obtained || 0}
                          onChange={(e) => handleMarksChange(student.id, parseInt(e.target.value) || 0)}
                          disabled={result?.is_absent}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                          {grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={result?.is_absent || false}
                          onCheckedChange={(checked) => handleAbsentChange(student.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="মন্তব্য"
                          value={result?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            মোট ছাত্র: {eligibleStudents.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={bulkAddResults.isPending || eligibleStudents.length === 0}
            >
              {bulkAddResults.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamResultsForm;
