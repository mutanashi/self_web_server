import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!api|_next|static|_next/image|favicon.ico).*)"],
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl
  const token = req.cookies.get("token")?.value

  // 1️⃣ Not logged in → back to /?code=login-required
  if (!token) {
    if (pathname !== "/") {
      const url = req.nextUrl.clone()
    url.pathname = "/"
      url.searchParams.set("code", "login-required")
      return NextResponse.redirect(url)
    }
    return NextResponse.next() // allow home page
  }

  // 2️⃣ Validate the token
  let userLevel: string | null = null
  try {
    const res = await fetch(`${origin}/api/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (data.valid) {
      userLevel = data.userLevel
    } else {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("code", "login-required")
      return NextResponse.redirect(url)
    }
  } catch (err) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("code", "login-required")
    return NextResponse.redirect(url)
  }

  // 3️⃣ Normal user tried to access admin pages
  if (userLevel !== "admin" && pathname.startsWith("/dashboard")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("code", "no-permission")
    return NextResponse.redirect(url)
  }

  // 4️⃣ Admin tried to access user-dashboard pages
  if (userLevel !== "user" && pathname.startsWith("/user-dashboard")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("code", "no-permission")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

