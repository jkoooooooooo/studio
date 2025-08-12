"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  School,
  Loader2,
  Group,
  PieChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student, AttendanceRecord } from "@/lib/types";
import {
  getStudents,
  getAttendance,
  addStudent,
  deleteStudent,
  markAttendance,
  deleteAttendance,
} from "@/lib/api";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { StudentsTab } from "./dashboard/students-tab";
import { AttendanceTab } from "./dashboard/attendance-tab";
import { DashboardTab } from "./dashboard/dashboard-tab";
import { ClassAttendanceTab } from "./dashboard/class-attendance-tab";
import { ClassStatsTab } from "./dashboard/class-stats-tab";

type Section = "dashboard" | "students" | "records" | "class-attendance" | "class-stats";

export function Dashboard() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = React.useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeSection, setActiveSection] =
    React.useState<Section>("dashboard");
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsData, attendanceData] = await Promise.all([
        getStudents(),
        getAttendance(),
      ]);
      setStudents(studentsData || []);
      setAttendanceRecords(attendanceData || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setStudents([]);
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddStudent = async (data: Omit<Student, "studentId">) => {
    try {
      await addStudent(data);
      toast({
        title: "Success",
        description: "Student added successfully.",
      });
      await loadData();
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add student",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      return false;
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      await loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete student",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const handleMarkAttendance = async (data: {
    studentId: string;
    date: string;
    status: string;
  }) => {
    try {
      // Check for existing record
      const dateStr = data.date;
      const existingRecord = attendanceRecords.find(
        (record) => record.studentId === data.studentId && record.date === dateStr
      );
      if (existingRecord) {
        toast({
          variant: "destructive",
          title: "Attendance Already Marked",
          description: `Attendance for this student has already been marked on this day.`,
        });
        return false;
      }
      await markAttendance(data);
      toast({
        title: "Success",
        description: "Attendance marked successfully.",
      });
      await loadData();
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to mark attendance",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      return false;
    }
  };

  const handleApplyFilters = async (filters: {
    studentId?: string;
    date?: string;
    classId?: string;
  }) => {
    setIsLoading(true);
    try {
      const filteredData = await getAttendance(filters);
      setAttendanceRecords(filteredData || []);
      toast({
        title: "Success",
        description: "Filters applied.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to apply filters",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setIsLoading(true);
    try {
      const allData = await getAttendance();
      setAttendanceRecords(allData || []);
      toast({
        title: "Success",
        description: "Filters cleared.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to clear filters",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string, studentId: string) => {
    try {
      await deleteAttendance({ attendanceId, studentId });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully.",
      });
      await loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete record",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  const renderContent = () => {
    if (isLoading && !students.length && !attendanceRecords.length) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardTab
            students={students}
            attendanceRecords={attendanceRecords}
          />
        );
      case "class-attendance":
        return (
          <ClassAttendanceTab
            students={students}
            attendanceRecords={attendanceRecords}
            onMarkAttendance={handleMarkAttendance}
            isLoading={isLoading}
          />
        );
      case "students":
        return (
          <StudentsTab
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "class-stats":
        return (
          <ClassStatsTab
            students={students}
            attendanceRecords={attendanceRecords}
          />
        );
      case "records":
        return (
          <AttendanceTab
            students={students}
            attendanceRecords={attendanceRecords}
            onMarkAttendance={handleMarkAttendance}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onDeleteAttendance={handleDeleteAttendance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <School className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">AttendaTrack</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("dashboard")}
                  isActive={activeSection === "dashboard"}
                >
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("class-attendance")}
                  isActive={activeSection === "class-attendance"}
                >
                  <Group />
                  Class Attendance
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("students")}
                  isActive={activeSection === "students"}
                >
                  <Users />
                  Students
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("class-stats")}
                  isActive={activeSection === "class-stats"}
                >
                  <PieChart />
                  Class Stats
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveSection("records")}
                  isActive={activeSection === "records"}
                >
                  <ListChecks />
                  Attendance
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
