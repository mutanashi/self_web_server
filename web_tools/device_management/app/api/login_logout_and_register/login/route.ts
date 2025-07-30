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

  const db = await openDB()
  const user = await db.get(
    "SELECT * FROM users WHERE username = ?",
    username
  )

  if (!user) {
    return NextResponse.json({ code: "user-not-exist" })
  }

  if (!await bcrypt.compare(password, user.passwordHash)) {
    return NextResponse.json({ code: "password-wrong" })
  }

  // 若資料庫中無 token，就自動生成並更新
  let token = user.token
  if (!token) {
    token = randomUUID()
    await db.run("UPDATE users SET token = ? WHERE username = ?", token, username)
  }

  const redirectTo = user.userLevel === "admin" ? "/dashboard" : "/user-dashboard"
  const response = NextResponse.json({ code: "login-success", redirectTo })


  // 設定 cookies：username, uuid, token
  response.cookies.set("username", username)
  response.cookies.set("uuid", user.uuid)
  response.cookies.set("token", token)

  return response
}

