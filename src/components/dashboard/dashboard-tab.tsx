"use client";

import type { Student, AttendanceRecord } from "@/lib/types";
import { StatsCards } from "./stats-cards";
import { AttendanceChart } from "./attendance-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DashboardTabProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
}

export function DashboardTab({
  students,
  attendanceRecords,
}: DashboardTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <StatsCards students={students} attendanceRecords={attendanceRecords} />
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceChart attendanceRecords={attendanceRecords} />
        </CardContent>
      </Card>
    </div>
  );
}
