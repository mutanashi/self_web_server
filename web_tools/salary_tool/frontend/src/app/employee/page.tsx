"use client";

import { useEffect, useMemo, useState } from "react";
import { apiCall } from "@/lib/api";

type Attendance = {
  id?: number;
  date?: string;
  checkInTime?: string;
};

type SalaryRecord = {
  id?: number;
  year?: number;
  month?: number;
  amount?: number;
  details?: string;
};

export default function EmployeePage() {
  const [raw, setRaw] = useState<string>("Ready.");
  const [attStart, setAttStart] = useState<string>("");
  const [attEnd, setAttEnd] = useState<string>("");
  const [salYear, setSalYear] = useState<string>("");
  const [salMonth, setSalMonth] = useState<string>("");
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    setAttStart(start);
    setAttEnd(end);
    setSalYear(String(today.getFullYear()));
    setSalMonth(String(today.getMonth() + 1));
  }, [today]);

  const setOut = (data: unknown) => setRaw(typeof data === "string" ? data : JSON.stringify(data, null, 2));

  const clockIn = async () => {
    const resp = await apiCall<Attendance>("/api/employee/clock-in", { method: "POST", auth: true });
    setOut(resp);
  };

  const loadAttendances = async () => {
    const q = new URLSearchParams();
    if (attStart) q.set("start", attStart);
    if (attEnd) q.set("end", attEnd);
    const resp = await apiCall<Attendance[]>(`/api/employee/attendances?${q.toString()}`, { auth: true });
    setOut(resp);
    if (resp.ok && Array.isArray(resp.body)) setAttendances(resp.body);
  };

  const loadSalaries = async () => {
    const q = new URLSearchParams();
    if (salYear) q.set("year", salYear);
    if (salMonth) q.set("month", salMonth);
    const resp = await apiCall<SalaryRecord[]>(`/api/employee/salaries?${q.toString()}`, { auth: true });
    setOut(resp);
    if (resp.ok && Array.isArray(resp.body)) setSalaries(resp.body);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Employee</h1>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Clock-in</h2>
        <button className="border px-2 py-1" onClick={clockIn}>Clock In (now)</button>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Attendances</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input className="border px-2 py-1" type="date" value={attStart} onChange={(e) => setAttStart(e.target.value)} />
          <input className="border px-2 py-1" type="date" value={attEnd} onChange={(e) => setAttEnd(e.target.value)} />
          <button className="border px-2 py-1" onClick={loadAttendances}>Fetch</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-[480px] border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">Date</th>
                <th className="border px-2 py-1 text-left">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((a, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{a.date ?? ""}</td>
                  <td className="border px-2 py-1">{a.checkInTime ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Salaries (This Month)</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input className="border px-2 py-1 w-28" type="number" placeholder="year" value={salYear} onChange={(e) => setSalYear(e.target.value)} />
          <input className="border px-2 py-1 w-28" type="number" placeholder="month" value={salMonth} onChange={(e) => setSalMonth(e.target.value)} />
          <button className="border px-2 py-1" onClick={loadSalaries}>Fetch</button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-[480px] border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1 text-left">Year</th>
                <th className="border px-2 py-1 text-left">Month</th>
                <th className="border px-2 py-1 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{s.year ?? ""}</td>
                  <td className="border px-2 py-1">{s.month ?? ""}</td>
                  <td className="border px-2 py-1">{s.amount ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium">Raw</h2>
        <pre className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">{raw}</pre>
      </section>
    </div>
  );
}


