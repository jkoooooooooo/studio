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
  LogIn,
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
import { Button } from "./ui/button";

type Section =
  | "dashboard"
  | "students"
  | "attendance"
  | "class-attendance"
  | "class-stats";

export function Dashboard() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = React.useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeSection, setActiveSection] =
    React.useState<Section>("dashboard");
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const cognitoLoginUrl = "https://eu-north-1buew0tukc.auth.eu-north-1.amazoncognito.com/login?client_id=2jlrpghnigsvncplvi4qao636m&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fd1ow1h8mkm5sgu.cloudfront.net%2F";

  const loadData = React.useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    };
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
  }, [toast, isLoggedIn]);

  React.useEffect(() => {
    // In a real app, you'd check for a token here
    // For now, we simulate being logged out initially
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      // This is a simplified check. A real app would validate the code.
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

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

  const handleDeleteAttendance = async (data: { studentId: string; date: string }) => {
    try {
      await deleteAttendance(data);
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
    if (!isLoggedIn) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome to AttendaTrack</h2>
            <p className="text-muted-foreground mb-4">Please log in to continue.</p>
            <Button onClick={() => window.location.href = cognitoLoginUrl}>
              <LogIn className="mr-2 h-4 w-4" /> Log In
            </Button>
          </div>
        </div>
      )
    }

    if (isLoading) {
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
            attendanceRecords={attendanceRecords}
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
      case "attendance":
        return (
          <AttendanceTab
            students={students}
            attendanceRecords={attendanceRecords}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onDeleteAttendance={handleDeleteAttendance}
            onMarkAttendance={handleMarkAttendance}
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
          {isLoggedIn && (
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
                    onClick={() => setActiveSection("attendance")}
                    isActive={activeSection === "attendance"}
                  >
                    <ListChecks />
                    Attendance
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
              </SidebarMenu>
            </SidebarContent>
          )}
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
