"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import type { Student } from "@/lib/types";
import { cn } from "@/lib/utils";
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


const markAttendanceSchema = z.object({
  classId: z.string({ required_error: "Please select a class." }),
  studentId: z.string({ required_error: "Please select a student." }),
  date: z.date({ required_error: "A date is required." }),
  status: z.enum(["Present", "Absent"], {
    required_error: "You need to select an attendance status.",
  }),
});

interface MarkAttendanceTabProps {
  students: Student[];
  onMarkAttendance: (data: { studentId: string; date: string; status: string }) => Promise<boolean>;
}

export function MarkAttendanceTab({
  students,
  onMarkAttendance,
}: MarkAttendanceTabProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof markAttendanceSchema>>({
    resolver: zodResolver(markAttendanceSchema),
    defaultValues: { date: new Date(), studentId: "", classId: "" },
  });

  const uniqueClasses = React.useMemo(() => {
    const classIds = new Set(students.map((s) => s.classId));
    return Array.from(classIds);
  }, [students]);

  const studentsInClass = React.useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.classId === selectedClass);
  }, [students, selectedClass])

  const onSubmit = async (
    data: z.infer<typeof markAttendanceSchema>
  ) => {
    setIsSubmitting(true);
    const dateStr = format(data.date, "yyyy-MM-dd");

    const success = await onMarkAttendance({
      studentId: data.studentId,
      date: dateStr,
      status: data.status,
    });
    if(success) {
      form.reset({ studentId: '', classId: data.classId, status: undefined, date: new Date() });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mark Attendance</h2>
          <p className="text-muted-foreground">
            Mark daily attendance for a single student.
          </p>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Mark Student Attendance</CardTitle>
                <CardDescription>
                  Select a class, student, and date to mark their attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                 <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedClass(value);
                          form.setValue("studentId", ""); // Reset student
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
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
                      <FormLabel>Student</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedClass}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studentsInClass.map((student) => (
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Present" />
                            </FormControl>
                            <FormLabel className="font-normal">Present</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Absent" />
                            </FormControl>
                            <FormLabel className="font-normal">Absent</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Attendance
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
    </div>
  );
}
