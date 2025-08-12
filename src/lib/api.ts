"use server";

import type { Student, AttendanceRecord } from "./types";

const API_BASE_URL = 'https://wyenkshrll.execute-api.eu-north-1.amazonaws.com/test';

async function apiCall(endpoint: string, method: 'GET' | 'POST' = 'GET', data: unknown = null) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 0 // No caching
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    const responseText = await response.text();
    if (!response.ok) {
        console.error('API Error Response:', responseText);
        throw new Error(`API request failed with status ${response.status}: ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Text:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    if (result.body) {
      try {
        result = JSON.parse(result.body);
      } catch (bodyParseError) {
        console.error('Body Parse Error:', bodyParseError);
        throw new Error('Invalid JSON in response body');
      }
    }

    if (result.success === false) { // Check for explicit false
      throw new Error(result.message || 'API call failed');
    }

    return result.data;
  } catch (error) {
    console.error(`API Error in ${method} ${endpoint}:`, error);
    throw error;
  }
}

export async function getStudents(): Promise<Student[]> {
  return apiCall('/get_students');
}

export async function addStudent(studentData: Omit<Student, 'studentId'>): Promise<any> {
  return apiCall('/add_student', 'POST', studentData);
}

export async function deleteStudent(studentId: string): Promise<any> {
    return apiCall('/delete_student', 'POST', { studentId });
}

export async function getAttendance(filters: { studentId?: string, date?: string, classId?: string } = {}): Promise<AttendanceRecord[]> {
  const params = new URLSearchParams();
  if (filters.studentId) params.append('studentId', filters.studentId);
  if (filters.date) params.append('date', filters.date);
  if (filters.classId) params.append('classId', filters.classId);
  const queryString = params.toString();
  return apiCall(`/get_attendance${queryString ? `?${queryString}` : ''}`);
}

export async function markAttendance(attendanceData: { studentId: string, date: string, status: string }): Promise<any> {
  return apiCall('/mark_attendance', 'POST', attendanceData);
}

export async function deleteAttendance(recordData: { studentId: string, date: string }): Promise<any> {
    return apiCall('/delete_attendance', 'POST', recordData);
}
