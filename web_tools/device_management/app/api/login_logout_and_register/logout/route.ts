import { NextRequest, NextResponse } from "next/server"
import { openDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { token } = await request.json()
  const db = await openDB()

  await db.run("UPDATE users SET token = NULL WHERE token = ?", token)

  return NextResponse.json({ success: true })
}

