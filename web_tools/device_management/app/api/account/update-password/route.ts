import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { openDB } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await req.json()

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing required fields" })
    }

    const db = await openDB()
    const user = await db.get("SELECT * FROM users WHERE username = ?", username)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" })
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!passwordMatches) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await db.run("UPDATE users SET passwordHash = ? WHERE username = ?", newHash, username)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" })
  }
}

