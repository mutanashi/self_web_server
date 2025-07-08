import { NextRequest, NextResponse } from "next/server"
import { openDB } from "@/lib/db"
import { randomUUID } from "crypto"
import bcrypt from "bcrypt"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ code: "missing-fields" })
  }
	
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json({ code: "missing-fields" })
  }

  const db = await openDB()

  const exists = await db.get("SELECT * FROM users WHERE username = ?", username)
  if (exists) {
    return NextResponse.json({ code: "user-already-exist" })
  }

  const uuid = randomUUID()
  const hashedPassword = await bcrypt.hash(password, 10)

  await db.run(
    `INSERT INTO users (uuid, username, passwordHash, userLevel, token)
     VALUES (?, ?, ?, ?, ?)`,
    uuid,
    username,
    hashedPassword,    // ⚠️ 建議正式環境使用 bcrypt hash
    "user",
    null
  )

  return NextResponse.json({ code: "register-success" })
}

