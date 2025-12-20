import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/* =========================
   Helpers
========================= */

function excelDateToJSDate(excelDate: number): string {
  const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
  return jsDate.toISOString().split("T")[0];
}

function excelTimeToString(excelTime: number): string {
  const totalMinutes = Math.round(excelTime * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function calculateWorkedHours(inTime: string | null, outTime: string | null): number {
  if (!inTime || !outTime) return 0;
  const [inH, inM] = inTime.split(":").map(Number);
  const [outH, outM] = outTime.split(":").map(Number);
  const diff = outH * 60 + outM - (inH * 60 + inM);
  return diff > 0 ? Number((diff / 60).toFixed(2)) : 0;
}

function getExpectedHours(dateStr: string): number {
  const day = new Date(dateStr).getDay();
  if (day === 0) return 0;
  if (day === 6) return 4;
  return 8.5;
}

/* =========================
   POST API
========================= */

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const selectedMonth = formData.get("month") as string | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

  /* =========================
     Normalize Daily Records
  ========================= */

  const dailyRecords = rawRows.map((row: any) => {
    const employeeName = String(
      row["Employee Name"] ??
      row["Employee Name "] ??
      row["Employee"] ??
      row["Name"] ??
      ""
    ).trim();

    const date =
      typeof row["Date"] === "number"
        ? excelDateToJSDate(row["Date"])
        : row["Date"];

    const inTime =
      typeof row["In-Time"] === "number"
        ? excelTimeToString(row["In-Time"])
        : row["In-Time"] || null;

    const outTime =
      typeof row["Out-Time"] === "number"
        ? excelTimeToString(row["Out-Time"])
        : row["Out-Time"] || null;

    const workedHours = calculateWorkedHours(inTime, outTime);
    const expectedHours = getExpectedHours(date);
    const isLeave = expectedHours > 0 && (!inTime || !outTime);

    return {
      employeeName,
      date,
      workedHours,
      expectedHours,
      isLeave,
    };
  });

  /* =========================
     Available Months
  ========================= */

  const availableMonths = Array.from(
    new Set(dailyRecords.map((r) => r.date.slice(0, 7)))
  ).sort();

  /* =========================
     Overall Aggregation
  ========================= */

  function aggregate(records: any[]) {
    const report: any = {};

    for (const r of records) {
      if (!report[r.employeeName]) {
        report[r.employeeName] = {
          employeeName: r.employeeName,
          totalExpectedHours: 0,
          totalWorkedHours: 0,
          leavesUsed: 0,
          allowedLeaves: 2,
          productivity: 0,
          dailyBreakdown: [],
        };
      }

      report[r.employeeName].totalExpectedHours += r.expectedHours;
      report[r.employeeName].totalWorkedHours += r.workedHours;
      if (r.isLeave) report[r.employeeName].leavesUsed++;

      report[r.employeeName].dailyBreakdown.push(r);
    }

    Object.values(report).forEach((emp: any) => {
      emp.productivity =
        emp.totalExpectedHours === 0
          ? 0
          : Number(
              ((emp.totalWorkedHours / emp.totalExpectedHours) * 100).toFixed(2)
            );
    });

    return Object.values(report);
  }

  const overallEmployees = aggregate(dailyRecords);

  const monthlyEmployees = selectedMonth
    ? aggregate(dailyRecords.filter((r) => r.date.startsWith(selectedMonth)))
    : [];

  return NextResponse.json({
    availableMonths,
    overallEmployees,
    monthlyEmployees,
    selectedMonth,
  });
}

