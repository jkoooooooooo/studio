"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Filter,
  X,
  Trash2,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import type { Student, AttendanceRecord } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const filterSchema = z.object({
  studentId: z.string().optional(),
  date: z.date().optional(),
  classId: z.string().optional(),
});

interface AttendanceTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onApplyFilters: (filters: { studentId?: string; date?: string; classId?: string }) => void;
  onClearFilters: () => void;
  onDeleteAttendance: (data: { studentId: string, date: string }) => void;
}

export function AttendanceTab({
  students,
  attendanceRecords,
  onApplyFilters,
  onClearFilters,
  onDeleteAttendance
}: AttendanceTabProps) {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<AttendanceRecord | null>(null);

  const filterForm = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: { studentId: '', classId: '', date: undefined },
  });

  const onFilterSubmit = (data: z.infer<typeof filterSchema>) => {
    onApplyFilters({
      ...data,
      date: data.date ? format(data.date, "yyyy-MM-dd") : undefined,
    });
  };

  const handleClearFilters = () => {
    filterForm.reset({ studentId: '', date: undefined, classId: '' });
    onClearFilters();
  };

  const openDeleteDialog = (record: AttendanceRecord) => {
    setRecordToDelete(record);
    setIsAlertOpen(true);
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "Present": return "default";
      case "Absent": return "destructive";
      default: return "outline";
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance History</h2>
          <p className="text-muted-foreground">
            A complete log of all attendance records.
          </p>
        </div>
        
        <Card>
          <Collapsible>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Filter Records</CardTitle>
                    <CardDescription>Filter attendance records by student, date, or class.</CardDescription>
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 p-0">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle Filters</span>
                    </Button>
                </CollapsibleTrigger>
            </CardHeader>
             <CollapsibleContent>
                <Form {...filterForm}>
                    <form onSubmit={filterForm.handleSubmit(onFilterSubmit)}>
                        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField
                            control={filterForm.control}
                            name="studentId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Student</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Students" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.studentId} value={student.studentId}>
                                            {student.name} ({student.rollNo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={filterForm.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        >
                                        {field.value ? format(field.value, "PPP") : <span>Any Date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < subDays(new Date(), 7)
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={filterForm.control}
                            name="classId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Class</FormLabel>
                                <FormControl>
                                    <Input placeholder="Any Class" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="ghost" type="button" onClick={handleClearFilters}>
                            <X className="mr-2 h-4 w-4" /> Clear
                            </Button>
                            <Button type="submit">
                            <Filter className="mr-2 h-4 w-4" /> Apply Filters
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </CollapsibleContent>
            </Collapsible>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceRecords.length > 0 ? (
                            attendanceRecords.map((record) => (
                                <TableRow key={record.attendanceId}>
                                    <TableCell>{format(new Date(record.date), "PP")}</TableCell>
                                    <TableCell className="font-medium">{record.name}</TableCell>
                                    <TableCell>{record.rollNo}</TableCell>
                                    <TableCell>{record.classId}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(record.status)}>{record.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(record)}>
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
                                <TableCell colSpan={6} className="h-24 text-center">No records found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the attendance record for <strong>{recordToDelete?.name}</strong> on {recordToDelete?.date ? format(new Date(recordToDelete.date), 'PP') : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (recordToDelete) {
                  onDeleteAttendance({ studentId: recordToDelete.studentId, date: recordToDelete.date });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
