"use client";

import * as React from "react";
import { Users, Percent, CalendarCheck, CalendarX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student, AttendanceRecord } from "@/lib/types";
import { format } from "date-fns";

interface StatsCardsProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

export function StatsCards({ students, attendanceRecords }: StatsCardsProps) {
  const stats = React.useMemo(() => {
    const totalStudents = students.length;
    
    const presentRecords = attendanceRecords.filter(r => r.status === 'Present').length;
    const totalTrackedRecords = attendanceRecords.length;
    const overallAttendanceRate = totalTrackedRecords > 0 ? (presentRecords / totalTrackedRecords) * 100 : 0;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayRecords = attendanceRecords.filter(r => r.date === todayStr);
    const todayPresent = todayRecords.filter(r => r.status === 'Present').length;
    const todayAbsent = todayRecords.filter(r => r.status === 'Absent').length;

    return {
      totalStudents,
      overallAttendanceRate,
      todayPresent,
      todayAbsent,
    };
  }, [students, attendanceRecords]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overall Attendance
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.overallAttendanceRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today Present</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayPresent}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today Absent</CardTitle>
          <CalendarX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayAbsent}</div>
        </CardContent>
      </Card>
    </div>
  );
}
