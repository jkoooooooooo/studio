export interface Student {
  studentId: string;
  name: string;
  rollNo: string;
  classId: string;
  parentName?: string;
  parentPhone?: string;
}

export interface AttendanceRecord {
  attendanceId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Excused';
  name?: string;
  rollNo?: string;
  classId?: string;
}
