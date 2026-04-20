import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY, sbHeaders } from '@/lib/supabase'

export type Credit = {
  id: string
  type: 'welcome' | 'birthday' | 'referral'
  amount: number
  expires_at: string
}

export async function GET(req: Request) {
  const lineUserId = new URL(req.url).searchParams.get('line_user_id')
  if (!lineUserId || !SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ credits: [] })

  // 檢查生日禮資格
  const mRes = await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=birthday`,
    { headers: sbHeaders() }
  )
  const members = await mRes.json()
  const birthday: string | null = members[0]?.birthday ?? null

  if (birthday) {
    const today = new Date()
    const bday = new Date(birthday)
    if (today.getMonth() === bday.getMonth()) {
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/member_credits?line_user_id=eq.${encodeURIComponent(lineUserId)}&type=eq.birthday&created_at=gte.${thisMonthStart}&select=id`,
        { headers: sbHeaders() }
      )
      const existing = await checkRes.json()
      if (existing.length === 0) {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString()
        await fetch(`${SUPABASE_URL}/rest/v1/member_credits`, {
          method: 'POST',
          headers: sbHeaders({ Prefer: 'return=minimal' }),
          body: JSON.stringify({ line_user_id: lineUserId, type: 'birthday', amount: 100, expires_at: endOfMonth }),
        })
      }
    }
  }

  const now = new Date().toISOString()
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/member_credits?line_user_id=eq.${encodeURIComponent(lineUserId)}&used=eq.false&expires_at=gt.${now}&select=id,type,amount,expires_at&order=created_at.asc`,
    { headers: sbHeaders() }
  )
  const credits = await res.json()
  return NextResponse.json({ credits: Array.isArray(credits) ? credits : [] })
}
