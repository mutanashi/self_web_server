"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiCall, getBase, setBase, setToken, shortJwt } from "@/lib/api";

export default function Home() {
  const [base, setBaseUrl] = useState<string>("");
  const [jwtShort, setJwtShort] = useState<string>("(none)");
  const [out, setOut] = useState<string>("Ready.");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    setBaseUrl(getBase());
    setJwtShort(shortJwt());
  }, []);

  const saveBase = () => {
    setBase(base);
    setOut(`Saved base: ${base || "(same origin)"}`);
  };

  const logout = () => {
    setToken("");
    setJwtShort(shortJwt());
    setOut("Logged out");
  };

  const register = async () => {
    const resp = await apiCall("/api/auth/register", {
      method: "POST",
      body: { username, email, password },
    });
    setOut(JSON.stringify(resp, null, 2));
  };

  const login = async () => {
    const resp = await apiCall<{ token?: string }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setOut(JSON.stringify(resp, null, 2));
    if (resp.ok && resp.body && typeof resp.body === "object" && (resp.body as { token?: string }).token) {
      const token = (resp.body as { token: string }).token as string;
      setToken(token);
      setJwtShort(shortJwt());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold">Salary System</h1>
        <span className="text-gray-500">JWT: {jwtShort}</span>
        <button className="ml-auto border px-2 py-1" onClick={logout}>Logout</button>
      </div>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Environment</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm">Base URL</label>
          <input className="border px-2 py-1 w-80" value={base} onChange={(e) => setBaseUrl(e.target.value)} placeholder="default: same origin" />
          <button className="border px-2 py-1" onClick={saveBase}>Save</button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Leave empty to use same origin.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Register</h3>
          <input className="border px-2 py-1 w-full" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="border px-2 py-1 w-full" type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border px-2 py-1 w-full" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="border px-2 py-1" onClick={register}>Register</button>
        </div>
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Login</h3>
          <input className="border px-2 py-1 w-full" type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border px-2 py-1 w-full" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="border px-2 py-1" onClick={login}>Login</button>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium">Quick Links</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li><Link className="text-blue-600 underline" href="/dashboard/">Dashboard</Link></li>
          <li><Link className="text-blue-600 underline" href="/employee/">Employee</Link></li>
          <li><Link className="text-blue-600 underline" href="/boss/">Boss</Link></li>
          <li><Link className="text-blue-600 underline" href="/developer/">Developer</Link></li>
        </ul>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium">Raw Response</h2>
        <pre className="bg-gray-50 border rounded p-3 whitespace-pre-wrap text-sm">{out}</pre>
      </section>
    </div>
  );
}
