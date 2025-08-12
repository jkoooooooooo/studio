"use client";

import * as React from "react";
import { Percent, Users } from "lucide-react";
import type { Student, AttendanceRecord } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceChart } from "./attendance-chart";

interface ClassStatsTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

export function ClassStatsTab({
  students,
  attendanceRecords,
}: ClassStatsTabProps) {
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  const uniqueClasses = React.useMemo(() => {
    const classIds = new Set(students.map((s) => s.classId));
    return Array.from(classIds);
  }, [students]);

  const classStats = React.useMemo(() => {
    if (!selectedClass) return null;

    const studentsInClass = students.filter(s => s.classId === selectedClass);
    const recordsForClass = attendanceRecords.filter(r => r.classId === selectedClass);

    const totalStudents = studentsInClass.length;
    const presentRecords = recordsForClass.filter(r => r.status === 'Present').length;
    const totalTrackedRecords = recordsForClass.length;
    const overallAttendanceRate = totalTrackedRecords > 0 ? (presentRecords / totalTrackedRecords) * 100 : 0;

    return {
      totalStudents,
      overallAttendanceRate,
      recordsForClass,
    };
  }, [selectedClass, students, attendanceRecords]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Class Statistics</h2>
        <p className="text-muted-foreground">
          View attendance statistics for specific classes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Class</CardTitle>
          <CardDescription>
            Choose a class to view its attendance data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {uniqueClasses.map((classId) => (
                <SelectItem key={classId} value={classId}>
                  {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClass && classStats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">in {selectedClass}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Class Attendance Rate
                  </CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classStats.overallAttendanceRate.toFixed(1)}%
                  </div>
                   <p className="text-xs text-muted-foreground">for {selectedClass}</p>
                </CardContent>
              </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Attendance for {selectedClass}</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart attendanceRecords={classStats.recordsForClass} />
            </CardContent>
          </Card>
        </>
      )}
       {!selectedClass && (
         <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader>
              <CardTitle className="text-center">No Class Selected</CardTitle>
              <CardDescription>Please select a class to view its statistics.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
