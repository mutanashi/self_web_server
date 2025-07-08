import { NextRequest, NextResponse } from 'next/server'
import { openDB } from '@/lib/db'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { token } = await request.json()
  const db = await openDB()
  const user = await db.get('SELECT * FROM users WHERE token = ?', token)

  if (!user) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    userLevel: user.userLevel,
  })
}

