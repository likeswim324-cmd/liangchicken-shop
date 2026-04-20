import { NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'liangchicken2025'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', ADMIN_PASSWORD, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    sameSite: 'lax',
  })
  return res
}
