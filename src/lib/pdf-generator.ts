import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Bengali font support - using standard fonts with transliteration for now
const FONT_SIZE = {
  title: 18,
  subtitle: 14,
  normal: 11,
  small: 9,
};

interface StudentInfo {
  name: string;
  student_id: string;
  class_name: string;
  department: string;
  father_name?: string;
  mother_name?: string;
  phone?: string;
  guardian_phone?: string;
  address?: string;
  photo_url?: string;
}

interface ExamResult {
  subject: string;
  total_marks: number;
  marks_obtained: number;
  grade: string;
}

interface AttendanceData {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  attendance_percentage: number;
}

interface FeePaymentData {
  receipt_number: string;
  student_name: string;
  student_id: string;
  class_name: string;
  fee_type: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  month?: string;
  year?: number;
}

interface SalarySlipData {
  payment_id: string;
  staff_name: string;
  staff_id: string;
  designation: string;
  month: string;
  year: number;
  amount: number;
  payment_date: string;
  payment_method: string;
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return `৳ ${amount.toLocaleString('bn-BD')}`;
};

// Helper to format date
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('bn-BD');
};

// Generate header for all PDFs
const generateHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Institution name
  doc.setFontSize(FONT_SIZE.title);
  doc.setFont('helvetica', 'bold');
  doc.text('Madrasah Management System', pageWidth / 2, 20, { align: 'center' });
  
  // Title
  doc.setFontSize(FONT_SIZE.subtitle);
  doc.text(title, pageWidth / 2, 30, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(FONT_SIZE.normal);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 38, { align: 'center' });
  }
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(15, 42, pageWidth - 15, 42);
};

// Generate footer
const generateFooter = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(FONT_SIZE.small);
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, pageHeight - 10);
  doc.text('Madrasah Management System', pageWidth - 15, pageHeight - 10, { align: 'right' });
};

// Generate Student Report Card PDF
export const generateStudentReportCard = (
  student: StudentInfo,
  results: ExamResult[],
  examName: string,
  academicYear: number
): jsPDF => {
  const doc = new jsPDF();
  
  generateHeader(doc, 'Student Report Card', `${examName} - ${academicYear}`);
  
  // Student Info Section
  let yPos = 50;
  doc.setFontSize(FONT_SIZE.normal);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 15, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  const studentDetails = [
    ['Name:', student.name],
    ['Student ID:', student.student_id],
    ['Class:', student.class_name],
    ['Department:', student.department],
    ['Father\'s Name:', student.father_name || 'N/A'],
    ['Mother\'s Name:', student.mother_name || 'N/A'],
  ];
  
  studentDetails.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 15, yPos);
    yPos += 6;
  });
  
  // Results Table
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Examination Results', 15, yPos);
  
  const tableData = results.map((r) => [
    r.subject,
    r.total_marks.toString(),
    r.marks_obtained.toString(),
    r.grade,
  ]);
  
  // Calculate totals
  const totalMarks = results.reduce((sum, r) => sum + r.total_marks, 0);
  const obtainedMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0);
  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);
  
  tableData.push(['Total', totalMarks.toString(), obtainedMarks.toString(), `${percentage}%`]);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Subject', 'Total Marks', 'Obtained', 'Grade']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [236, 240, 241], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
  });
  
  // Signature section
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFont('helvetica', 'normal');
  doc.text('_____________________', 15, finalY);
  doc.text('Class Teacher', 15, finalY + 6);
  
  doc.text('_____________________', 140, finalY);
  doc.text('Principal', 140, finalY + 6);
  
  generateFooter(doc);
  
  return doc;
};

// Generate Fee Receipt PDF
export const generateFeeReceipt = (payment: FeePaymentData): jsPDF => {
  const doc = new jsPDF();
  
  generateHeader(doc, 'Fee Payment Receipt', `Receipt No: ${payment.receipt_number || 'N/A'}`);
  
  let yPos = 55;
  doc.setFontSize(FONT_SIZE.normal);
  
  // Receipt details
  const details = [
    ['Student Name:', payment.student_name],
    ['Student ID:', payment.student_id],
    ['Class:', payment.class_name],
    ['Fee Type:', payment.fee_type],
    ['Month/Year:', `${payment.month || ''} ${payment.year || ''}`],
    ['Payment Date:', formatDate(payment.payment_date)],
    ['Payment Method:', payment.payment_method],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 8;
  });
  
  // Amount box
  yPos += 10;
  doc.setFillColor(236, 240, 241);
  doc.rect(15, yPos - 5, 180, 20, 'F');
  doc.setFontSize(FONT_SIZE.subtitle);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Paid:', 20, yPos + 7);
  doc.text(formatCurrency(payment.amount), 170, yPos + 7, { align: 'right' });
  
  // Signature
  yPos += 40;
  doc.setFontSize(FONT_SIZE.normal);
  doc.setFont('helvetica', 'normal');
  doc.text('_____________________', 140, yPos);
  doc.text('Authorized Signature', 140, yPos + 6);
  
  generateFooter(doc);
  
  return doc;
};

// Generate Salary Slip PDF
export const generateSalarySlip = (salary: SalarySlipData): jsPDF => {
  const doc = new jsPDF();
  
  generateHeader(doc, 'Salary Slip', `${salary.month} ${salary.year}`);
  
  let yPos = 55;
  doc.setFontSize(FONT_SIZE.normal);
  
  // Staff details
  const details = [
    ['Staff Name:', salary.staff_name],
    ['Staff ID:', salary.staff_id],
    ['Designation:', salary.designation],
    ['Payment ID:', salary.payment_id],
    ['Payment Date:', formatDate(salary.payment_date)],
    ['Payment Method:', salary.payment_method],
  ];
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 8;
  });
  
  // Salary breakdown
  yPos += 15;
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: [
      ['Basic Salary', formatCurrency(salary.amount)],
      ['Allowances', formatCurrency(0)],
      ['Deductions', formatCurrency(0)],
    ],
    foot: [['Net Salary', formatCurrency(salary.amount)]],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [46, 204, 113], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 1: { halign: 'right' } },
  });
  
  // Signature
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.text('_____________________', 15, finalY);
  doc.text('Employee Signature', 15, finalY + 6);
  
  doc.text('_____________________', 140, finalY);
  doc.text('Authorized Signature', 140, finalY + 6);
  
  generateFooter(doc);
  
  return doc;
};

// Generate Attendance Report PDF
export const generateAttendanceReport = (
  student: StudentInfo,
  attendance: AttendanceData,
  startDate: string,
  endDate: string
): jsPDF => {
  const doc = new jsPDF();
  
  generateHeader(doc, 'Attendance Report', `${formatDate(startDate)} to ${formatDate(endDate)}`);
  
  let yPos = 55;
  doc.setFontSize(FONT_SIZE.normal);
  
  // Student info
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 15, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, 15, yPos);
  doc.text(`ID: ${student.student_id}`, 100, yPos);
  yPos += 6;
  doc.text(`Class: ${student.class_name}`, 15, yPos);
  doc.text(`Department: ${student.department}`, 100, yPos);
  
  // Attendance summary
  yPos += 20;
  autoTable(doc, {
    startY: yPos,
    head: [['Attendance Summary', 'Days']],
    body: [
      ['Total Working Days', attendance.total_days.toString()],
      ['Present Days', attendance.present_days.toString()],
      ['Absent Days', attendance.absent_days.toString()],
      ['Late Days', attendance.late_days.toString()],
      ['Leave Days', attendance.leave_days.toString()],
    ],
    foot: [['Attendance Percentage', `${attendance.attendance_percentage}%`]],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { 
      fillColor: attendance.attendance_percentage >= 75 ? [46, 204, 113] : [231, 76, 60], 
      textColor: 255, 
      fontStyle: 'bold' 
    },
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: { 1: { halign: 'center' } },
  });
  
  // Remarks
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'italic');
  if (attendance.attendance_percentage >= 75) {
    doc.text('Status: Attendance is satisfactory.', 15, finalY);
  } else {
    doc.text('Status: Attendance needs improvement. Please contact the class teacher.', 15, finalY);
  }
  
  generateFooter(doc);
  
  return doc;
};

// Download PDF helper
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(`${filename}.pdf`);
};

// Print PDF helper
export const printPDF = (doc: jsPDF) => {
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
