"use client";

import { useState } from "react";
// import { apiCall } from "@/lib/api";

// Placeholder endpoints for developer actions are not defined in the backend yet.
// Provide UI and wire later when backend endpoints are available.

export default function DeveloperPage() {
  const [raw, setRaw] = useState("Ready.");
  const [email, setEmail] = useState("");

  const setOut = (data: unknown) => setRaw(typeof data === "string" ? data : JSON.stringify(data, null, 2));

  const addBoss = async () => {
    // TODO: Replace with real API endpoint when available
    setOut({ status: "not-implemented", action: "addBoss", email });
  };

  const removeBoss = async () => {
    // TODO: Replace with real API endpoint when available
    setOut({ status: "not-implemented", action: "removeBoss", email });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Developer</h1>

      <section className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Boss Accounts</h2>
        <input className="border px-2 py-1" type="email" placeholder="boss email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex gap-2">
          <button className="border px-2 py-1" onClick={addBoss}>Add Boss</button>
          <button className="border px-2 py-1" onClick={removeBoss}>Remove Boss</button>
        </div>
        <p className="text-sm text-gray-500">Backend endpoints not defined yet. This is a stub.</p>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium">Raw</h2>
        <pre className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">{raw}</pre>
      </section>
    </div>
  );
}


