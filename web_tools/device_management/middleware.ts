import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Only touch API under your basePath
  if (!url.pathname.startsWith('/web_tools/device_management/api/')) {
    return NextResponse.next()
  }

  // If API path ends with a slash, rewrite to the no-slash version
  if (url.pathname.endsWith('/')) {
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = rewriteUrl.pathname.replace(/\/+$/, '')
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/web_tools/device_management/api/:path*'],
}