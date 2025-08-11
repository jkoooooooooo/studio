"use client";

import * as React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { subDays, format } from "date-fns";
import type { AttendanceRecord } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface AttendanceChartProps {
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceChart({ attendanceRecords }: AttendanceChartProps) {
  const data = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

    return last7Days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const recordsForDay = attendanceRecords.filter(r => r.date === dateStr);
      
      return {
        date: format(day, "MMM d"),
        Present: recordsForDay.filter(r => r.status === 'Present').length,
        Absent: recordsForDay.filter(r => r.status === 'Absent').length,
        Excused: recordsForDay.filter(r => r.status === 'Excused').length,
      };
    });
  }, [attendanceRecords]);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)"
            }}
          />
          <Bar dataKey="Present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
