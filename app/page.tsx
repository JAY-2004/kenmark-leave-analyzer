"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  // NEW: separate selected vs applied month
  const [selectedMonth, setSelectedMonth] = useState("");
  const [appliedMonth, setAppliedMonth] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!file) {
      alert("Please upload Excel file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    if (selectedMonth) formData.append("month", selectedMonth);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setData(result);

    // Apply month ONLY after analyze
    setAppliedMonth(selectedMonth);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Leave & Productivity Analyzer
      </h1>

      {/* Upload Card */}
      <div className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {data?.availableMonths && (
          <select
            className="w-full border p-2 rounded"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month (optional)</option>
            {data.availableMonths.map((m: string) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}

        {selectedMonth && selectedMonth !== appliedMonth && (
          <p className="text-sm text-orange-600">
            Month changed. Click Analyze to update results.
          </p>
        )}

        <button
          onClick={analyze}
          disabled={loading || !file}
          className={`w-full py-2 rounded text-white transition
            ${
              selectedMonth
                ? "bg-blue-600 hover:bg-blue-700 animate-pulse"
                : "bg-blue-600 hover:bg-blue-700"
            }
            ${loading ? "opacity-70 cursor-not-allowed" : ""}
          `}
        >
          {loading ? "Processing..." : "Analyze"}
        </button>
      </div>

      {/* RESULTS */}
      {data?.overallEmployees && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-6xl mx-auto">
          
          {/* Overall Summary */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Overall Summary</h2>
            <EmployeeCards employees={data.overallEmployees} />
          </div>

          {/* Monthly Summary */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Monthly Summary{" "}
              {appliedMonth && `(${appliedMonth})`}
            </h2>

            {!appliedMonth && (
              <p className="text-gray-500">
                Select a month and click Analyze to view monthly data.
              </p>
            )}

            {appliedMonth &&
              data?.monthlyEmployees?.length > 0 && (
                <EmployeeCards employees={data.monthlyEmployees} />
              )}

            {appliedMonth &&
              data?.monthlyEmployees?.length === 0 && (
                <p className="text-red-600">
                  No data available for selected month.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeCards({ employees }: any) {
  return (
    <div className="space-y-4">
      {employees.map((emp: any) => (
        <div
          key={emp.employeeName}
          className="border rounded p-4"
        >
          <h3 className="font-semibold mb-2">
            {emp.employeeName}
          </h3>
          <p>Total Expected: {emp.totalExpectedHours}</p>
          <p>Total Worked: {emp.totalWorkedHours}</p>
          <p>Leaves Used: {emp.leavesUsed} / 2</p>
          <p>Productivity: {emp.productivity}%</p>
        </div>
      ))}
    </div>
  );
}
