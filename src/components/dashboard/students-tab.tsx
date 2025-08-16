"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, MoreHorizontal, Loader2, FileText, Printer } from "lucide-react";
import type { Student, AttendanceRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { generateStudentReport } from "@/ai/flows/student-report-flow";
import { useToast } from "@/hooks/use-toast";


const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rollNo: z.string().min(1, "Roll number is required"),
  classId: z.string().min(1, "Class is required"),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentsTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onAddStudent: (data: StudentFormData) => Promise<boolean>;
  onDeleteStudent: (studentId: string) => void;
}

export function StudentsTab({
  students,
  attendanceRecords,
  onAddStudent,
  onDeleteStudent,
}: StudentsTabProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
  const [currentReport, setCurrentReport] = React.useState<{ studentName: string, content: string } | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      rollNo: "",
      classId: "",
      parentName: "",
      parentPhone: "",
    },
  });

  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students;
    const lowercasedQuery = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowercasedQuery) ||
        student.rollNo.toLowerCase().includes(lowercasedQuery)
    );
  }, [students, searchQuery]);

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    const success = await onAddStudent(data);
    if (success) {
      setIsSheetOpen(false);
      form.reset();
    }
    setIsSubmitting(false);
  };

  const openDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsAlertOpen(true);
  };

  const handleGenerateReport = async (student: Student) => {
    setIsGeneratingReport(true);
    setCurrentReport(null);
    setIsReportDialogOpen(true);

    try {
      const studentAttendance = attendanceRecords.filter(
        (record) => record.studentId === student.studentId
      );

      const reportContent = await generateStudentReport({
        student: student,
        attendanceRecords: studentAttendance,
      });
      setCurrentReport({ studentName: student.name, content: reportContent });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: "Could not generate the attendance report. Please try again."
      });
       setIsReportDialogOpen(false);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow && currentReport) {
      printWindow.document.write('<html><head><title>Student Attendance Report</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; } pre { white-space: pre-wrap; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>Attendance Report for ${currentReport.studentName}</h1>`);
      printWindow.document.write(`<pre>${currentReport.content}</pre>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Student Management
            </h2>
            <p className="text-muted-foreground">
              Add, view, and manage student records.
            </p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              A list of all students in the system.
            </CardDescription>
            <div className="pt-2">
                <Input
                  placeholder="Search by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.classId}</TableCell>
                      <TableCell>{student.parentName || "N/A"}</TableCell>
                      <TableCell>{student.parentPhone || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleGenerateReport(student)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Generate Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(student)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>Add a New Student</SheetTitle>
                <SheetDescription>
                  Fill in the details below to add a new student to the system.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="S123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Input placeholder="10-A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent's Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <SheetFooter>
                <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Student
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the student{" "}
              <strong>{studentToDelete?.name}</strong> and all associated
              records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (studentToDelete) {
                  onDeleteStudent(studentToDelete.studentId);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Generated Attendance Report</DialogTitle>
            <DialogDescription>
              {currentReport ? `Report for ${currentReport.studentName}` : 'Generating report...'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGeneratingReport && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-muted-foreground">The AI is analyzing the data...</p>
              </div>
            )}
            {currentReport && (
              <Card>
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {currentReport.content}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={handlePrintReport} disabled={!currentReport || isGeneratingReport}>
                  <Printer className="mr-2 h-4 w-4"/>
                  Print
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
