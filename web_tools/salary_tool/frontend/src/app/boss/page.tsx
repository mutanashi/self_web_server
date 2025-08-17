"use client";

import { useState } from "react";
import { apiCall } from "@/lib/api";

export default function BossPage() {
  const [raw, setRaw] = useState("Ready.");

  // create employee
  const [ceUsername, setCeUsername] = useState("");
  const [ceEmail, setCeEmail] = useState("");
  const [cePass, setCePass] = useState("");
  const [ceLabels, setCeLabels] = useState("");

  // create public item
  const [piTitle, setPiTitle] = useState("");
  const [piContent, setPiContent] = useState("");

  // export
  const [exLabels, setExLabels] = useState("");
  const [exYear, setExYear] = useState("");
  const [exMonth, setExMonth] = useState("");

  const setOut = (data: unknown) => setRaw(typeof data === "string" ? data : JSON.stringify(data, null, 2));

  const createEmployee = async () => {
    const labels = ceLabels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body: { username: string; email: string; password: string; labels?: string[] } = {
      username: ceUsername,
      email: ceEmail,
      password: cePass,
    };
    if (labels.length) body.labels = labels;
    const resp = await apiCall("/api/boss/employees", { method: "POST", body, auth: true });
    setOut(resp);
  };

  const createPublicItem = async () => {
    const resp = await apiCall("/api/boss/public-items", {
      method: "POST",
      body: { title: piTitle, content: piContent },
      auth: true,
    });
    setOut(resp);
  };

  const exportEmployees = async () => {
    const labels = exLabels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body: { labelNames?: string[]; year?: number; month?: number } = {};
    if (labels.length) body.labelNames = labels;
    if (exYear) body.year = Number(exYear);
    if (exMonth) body.month = Number(exMonth);
    const resp = await apiCall("/api/boss/export", { method: "POST", body, auth: true });
    setOut(resp);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Boss</h1>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Company Settings</h2>
        <p className="text-sm text-gray-500">(Placeholder: implement fields as needed)</p>
      </section>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Create Employee</h2>
        <input className="border px-2 py-1 w-full" placeholder="username" value={ceUsername} onChange={(e) => setCeUsername(e.target.value)} />
        <input className="border px-2 py-1 w-full" type="email" placeholder="email" value={ceEmail} onChange={(e) => setCeEmail(e.target.value)} />
        <input className="border px-2 py-1 w-full" placeholder="temp password" value={cePass} onChange={(e) => setCePass(e.target.value)} />
        <input className="border px-2 py-1 w-full" placeholder="labels (A,B)" value={ceLabels} onChange={(e) => setCeLabels(e.target.value)} />
        <button className="border px-2 py-1" onClick={createEmployee}>Create</button>
      </section>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Create Public Item</h2>
        <input className="border px-2 py-1 w-full" placeholder="title" value={piTitle} onChange={(e) => setPiTitle(e.target.value)} />
        <textarea className="border px-2 py-1 w-full" rows={3} placeholder="content" value={piContent} onChange={(e) => setPiContent(e.target.value)} />
        <button className="border px-2 py-1" onClick={createPublicItem}>Create</button>
      </section>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Export Employees</h2>
        <input className="border px-2 py-1" placeholder="labels (A,B)" value={exLabels} onChange={(e) => setExLabels(e.target.value)} />
        <input className="border px-2 py-1 w-24" type="number" placeholder="year" value={exYear} onChange={(e) => setExYear(e.target.value)} />
        <input className="border px-2 py-1 w-24" type="number" placeholder="month" value={exMonth} onChange={(e) => setExMonth(e.target.value)} />
        <button className="border px-2 py-1" onClick={exportEmployees}>Export</button>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium">Raw</h2>
        <pre className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">{raw}</pre>
      </section>
    </div>
  );
}


