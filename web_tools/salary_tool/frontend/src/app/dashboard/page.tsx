"use client";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link className="border rounded p-4 hover:bg-gray-50" href="/employee/">
          <div className="font-medium">Employee</div>
          <div className="text-sm text-gray-600">Attendance and salaries</div>
        </Link>
        <Link className="border rounded p-4 hover:bg-gray-50" href="/boss/">
          <div className="font-medium">Boss</div>
          <div className="text-sm text-gray-600">Company settings</div>
        </Link>
        <Link className="border rounded p-4 hover:bg-gray-50" href="/developer/">
          <div className="font-medium">Developer</div>
          <div className="text-sm text-gray-600">Admin utilities</div>
        </Link>
      </div>
    </div>
  );
}


