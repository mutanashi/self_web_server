import { NextRequest, NextResponse } from "next/server"
import { openDB } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const db = await openDB()

    const { username } = await req.json()
    const cookie = req.cookies.get("uuid")
    const uuid = cookie?.value

    if (!uuid || !username) {
      return NextResponse.json({ success: false, message: "Missing uuid or username" }, { status: 400 })
    }

    // 更新 username
    try {
      await db.run("UPDATE users SET username = ? WHERE uuid = ?", username, uuid)
    } catch (err: any) {
      if (err.code === "SQLITE_CONSTRAINT") {
        return NextResponse.json({ success: false, message: "Username already taken" })
      }
      return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 })
    }

    // 更新 cookie
    const res = NextResponse.json({ success: true })
    res.cookies.set("username", username, {
      path: "/",
      httpOnly: false,
    })

    return res
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ success: false, message: "Method Not Allowed" }, { status: 405 })
}

