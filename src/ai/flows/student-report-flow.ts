"use server";
/**
 * @fileOverview An AI flow to generate a student attendance report.
 *
 * - generateStudentReport - A function that creates a narrative summary of a student's attendance.
 * - StudentReportInput - The input type for the generateStudentReport function.
 */

import { ai } from "@/ai/genkit";
import { z } from "zod";
import type { Student, AttendanceRecord } from "@/lib/types";

const StudentReportInputSchema = z.object({
  student: z.object({
    name: z.string(),
    classId: z.string(),
  }),
  attendanceRecords: z.array(
    z.object({
      date: z.string(),
      status: z.enum(["Present", "Absent", "Half Day"]),
    })
  ),
});

export type StudentReportInput = z.infer<typeof StudentReportInputSchema>;

export async function generateStudentReport(
  input: StudentReportInput
): Promise<string> {
  const report = await studentReportFlow(input);
  return report;
}

const prompt = ai.definePrompt({
  name: "studentReportPrompt",
  input: { schema: StudentReportInputSchema },
  prompt: `You are an assistant principal at a high school. Your task is to write a brief, one-paragraph attendance report for a student.

Be formal and to the point.

The report is for:
Student Name: {{{student.name}}}
Class: {{{student.classId}}}

Here is their attendance data. The dates are in YYYY-MM-DD format.
{{#each attendanceRecords}}
- Date: {{this.date}}, Status: {{this.status}}
{{/each}}

Analyze the provided attendance records and generate a concise, narrative summary.
- Start by stating the student's name and class.
- Mention the total number of days tracked.
- State the number of days present, absent, and on half-day.
- If there are any absences, mention the dates.
- Conclude with a summary statement about their overall attendance (e.g., "excellent", "satisfactory", "needs improvement").
Do not output markdown or any other special formatting. Just the text of the report.`,
});

const studentReportFlow = ai.defineFlow(
  {
    name: "studentReportFlow",
    inputSchema: StudentReportInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // If there are no records, return a simple message.
    if (input.attendanceRecords.length === 0) {
      return `No attendance records found for ${input.student.name}. Cannot generate a report.`;
    }

    const { output } = await prompt(input);
    return output!;
  }
);
