"use client";
import Link from "next/link";

export default function DeveloperPage() {
  return (
    <div className="space-y-3">
      <h1>Developer</h1>
      <p>Manage boss accounts (placeholder).</p>
      <div className="text-sm text-gray-600">
        <Link className="text-blue-600 underline" href="/">Home</Link>
      </div>
    </div>
  );
}
