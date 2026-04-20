import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'liangchicken2025'

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const auth = req.cookies.get('admin_auth')?.value
  if (auth === ADMIN_PASSWORD) return NextResponse.next()

  // 已經在登入頁就放行
  if (req.nextUrl.pathname === '/admin/login') return NextResponse.next()

  return NextResponse.redirect(new URL('/admin/login', req.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
