import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY, sbHeaders } from '@/lib/supabase'

function genCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

async function issueCredit(line_user_id: string, type: string, amount: number, days: number) {
  const expires_at = new Date(Date.now() + days * 86400_000).toISOString()
  await fetch(`${SUPABASE_URL}/rest/v1/member_credits`, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify({ line_user_id, type, amount, expires_at }),
  })
}

export async function GET(req: Request) {
  const lineUserId = new URL(req.url).searchParams.get('line_user_id')
  if (!lineUserId || !SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ member: null })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=*`,
    { headers: sbHeaders() }
  )
  const rows = await res.json()
  return NextResponse.json({ member: rows[0] ?? null })
}

export async function POST(req: Request) {
  const { line_user_id, display_name, referred_by_code } = await req.json()
  if (!line_user_id || !SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ ok: false })

  // 若已存在，直接回傳
  const existing = await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(line_user_id)}&select=*`,
    { headers: sbHeaders() }
  )
  const rows = await existing.json()
  if (rows[0]) return NextResponse.json({ ok: true, member: rows[0], is_new: false })

  // 查推薦人
  let referred_by: string | null = null
  if (referred_by_code) {
    const rRes = await fetch(
      `${SUPABASE_URL}/rest/v1/members?referral_code=eq.${referred_by_code}&select=line_user_id`,
      { headers: sbHeaders() }
    )
    const rRows = await rRes.json()
    if (rRows[0]?.line_user_id) referred_by = rRows[0].line_user_id
  }

  // 建立會員
  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/members`, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify({ line_user_id, display_name, referral_code: genCode(), referred_by }),
  })
  const member = (await createRes.json())[0]

  // 發放入會禮（7 天）
  await issueCredit(line_user_id, 'welcome', 50, 7)

  return NextResponse.json({ ok: true, member, is_new: true })
}

export async function PUT(req: Request) {
  const { line_user_id, birthday } = await req.json()
  if (!line_user_id || !SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ ok: false })

  await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(line_user_id)}`,
    { method: 'PATCH', headers: sbHeaders(), body: JSON.stringify({ birthday }) }
  )
  return NextResponse.json({ ok: true })
}
