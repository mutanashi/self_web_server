import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salary Tool",
  description: "Frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Arial, sans-serif", margin: 0 }}>
        <nav style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12 }}>
          <Link href="/">Home</Link>
          <Link href="/dashboard/">Dashboard</Link>
          <Link href="/employee/">Employee</Link>
          <Link href="/boss/">Boss</Link>
          <Link href="/developer/">Developer</Link>
        </nav>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
