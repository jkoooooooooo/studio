"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Loader2,
} from "lucide-react";
import type { Student, AttendanceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const classAttendanceSchema = z.object({
  classId: z.string({ required_error: "Please select a class." }),
  date: z.date({ required_error: "A date is required." }),
  studentId: z.string().optional(),
});

type AttendanceStatus = "Present" | "Absent";

interface ClassAttendanceTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onMarkAttendance: (data: { studentId: string; date: string; status: string }) => Promise<boolean>;
  isLoading: boolean;
}

export function ClassAttendanceTab({
  students,
  attendanceRecords,
  onMarkAttendance,
  isLoading,
}: ClassAttendanceTabProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);
  const [
    studentStatuses,
    setStudentStatuses,
  ] = React.useState<Record<string, AttendanceStatus>>({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof classAttendanceSchema>>({
    resolver: zodResolver(classAttendanceSchema),
    defaultValues: { date: new Date(), classId: "", studentId: "" },
  });

  const uniqueClasses = React.useMemo(() => {
    const classIds = new Set(students.map((s) => s.classId));
    return Array.from(classIds);
  }, [students]);
  
  const studentsInClass = React.useMemo(() => {
    const filteredStudents = selectedClass ? students.filter((s) => s.classId === selectedClass) : [];
    const selectedStudentId = form.getValues("studentId");
    if(selectedStudentId) {
      return filteredStudents.filter(s => s.studentId === selectedStudentId);
    }
    return filteredStudents;
  }, [students, selectedClass, form]);
  
  React.useEffect(() => {
    // Reset statuses when class or student filter changes
    const initialStatuses: Record<string, AttendanceStatus> = {};
    studentsInClass.forEach(student => {
        initialStatuses[student.studentId] = 'Present'; // Default to Present
    });
    setStudentStatuses(initialStatuses);
  }, [studentsInClass])

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    form.setValue("classId", classId);
    form.setValue("studentId", ""); // Reset student filter
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({...prev, [studentId]: status}));
  }

  const handleMarkAll = (status: AttendanceStatus) => {
     const newStatuses: Record<string, AttendanceStatus> = {};
     studentsInClass.forEach(student => {
        newStatuses[student.studentId] = status;
     });
     setStudentStatuses(newStatuses);
  }

  const onSubmit = async (data: z.infer<typeof classAttendanceSchema>) => {
    setIsSubmitting(true);
    const date = format(data.date, "yyyy-MM-dd");

    const studentsToMark = studentsInClass.map(s => s.studentId);
    
    const existingRecords = attendanceRecords.filter(
      (record) => record.date === date && studentsToMark.includes(record.studentId)
    );

    if (existingRecords.length > 0) {
       toast({
        variant: "destructive",
        title: "Attendance Already Marked",
        description: `Attendance for one or more selected students has already been marked on ${format(data.date, "PP")}. Please delete existing records first if you wish to overwrite them.`,
      });
      setIsSubmitting(false);
      return;
    }

    const promises = Object.entries(studentStatuses).map(([studentId, status]) => {
        return onMarkAttendance({ studentId, date, status });
    });
    
    await Promise.all(promises);
    
    setIsSubmitting(false);
    toast({
        title: "Success",
        description: "Class attendance marked successfully."
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Class Attendance</h2>
        <p className="text-muted-foreground">
          Mark attendance for an entire class or a specific student.
        </p>
      </div>

       <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle>Select Class, Date and Student</CardTitle>
                <CardDescription>
                    Choose a class, date, and optionally a student to mark attendance for.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select onValueChange={handleClassChange} value={field.value ?? ""}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {uniqueClasses.map((classId) => (
                            <SelectItem key={classId} value={classId}>
                                {classId}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedClass}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Students" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="">All Students</SelectItem>
                          {students.filter(s => s.classId === selectedClass).map((student) => (
                            <SelectItem key={student.studentId} value={student.studentId}>
                              {student.name} ({student.rollNo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP")
                                ) : (
                                <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
              </Card>

              {selectedClass && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Mark Student Status</CardTitle>
                        <CardDescription>For class {selectedClass} on {format(form.getValues('date'), "PP")}</CardDescription>
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" type="button" onClick={() => handleMarkAll("Present")}>Mark All Present</Button>
                            <Button size="sm" variant="outline" type="button" onClick={() => handleMarkAll("Absent")}>Mark All Absent</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsInClass.length > 0 ? (
                                    studentsInClass.map((student) => (
                                        <TableRow key={student.studentId}>
                                            <TableCell>{student.rollNo}</TableCell>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell className="text-right">
                                            <RadioGroup
                                                value={studentStatuses[student.studentId] || 'Present'}
                                                onValueChange={(status: AttendanceStatus) => handleStatusChange(student.studentId, status)}
                                                className="flex justify-end gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Present" id={`${student.studentId}-present`}/>
                                                    <Label htmlFor={`${student.studentId}-present`}>P</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Absent" id={`${student.studentId}-absent`}/>
                                                    <Label htmlFor={`${student.studentId}-absent`}>A</Label>
                                                </div>
                                            </RadioGroup>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No students found for the selected criteria.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting || isLoading || studentsInClass.length === 0}>
                            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Attendance
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </form>
        </Form>
    </div>
  );
}
