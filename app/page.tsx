"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState("");
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
    if (month) formData.append("month", month);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setData(result);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Leave & Productivity Analyzer
      </h1>

      <div className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {data?.availableMonths && (
          <select
            className="w-full border p-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select Month (optional)</option>
            {data.availableMonths.map((m: string) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}

        <button
          onClick={analyze}
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Analyze"}
        </button>
      </div>

      {/* Overall Summary */}
      {data?.overallEmployees && (
        <Section title="Overall Summary" employees={data.overallEmployees} />
      )}

      {/* Monthly Summary */}
      {month && data?.monthlyEmployees?.length > 0 && (
        <Section
          title={`Monthly Summary (${month})`}
          employees={data.monthlyEmployees}
        />
      )}

      {month && data?.monthlyEmployees?.length === 0 && (
        <p className="text-center mt-6 text-red-600">
          No data available for selected month
        </p>
      )}
    </div>
  );
}

function Section({ title, employees }: any) {
  return (
    <div className="mt-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      {employees.map((emp: any) => (
        <div key={emp.employeeName} className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">{emp.employeeName}</h3>

          <p>Total Expected: {emp.totalExpectedHours}</p>
          <p>Total Worked: {emp.totalWorkedHours}</p>
          <p>Leaves Used: {emp.leavesUsed} / 2</p>
          <p>Productivity: {emp.productivity}%</p>
        </div>
      ))}
    </div>
  );
}
