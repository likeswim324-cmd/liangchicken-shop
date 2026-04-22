import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY, sbHeaders } from '@/lib/supabase'

export type CreditRecord = {
  id: string
  type: 'welcome' | 'birthday' | 'referral'
  amount: number
  expires_at: string
  used: boolean
  used_at: string | null
  created_at: string
}

export async function GET(req: Request) {
  const lineUserId = new URL(req.url).searchParams.get('line_user_id')
  if (!lineUserId || !SUPABASE_URL || !SUPABASE_KEY) return NextResponse.json({ records: [] })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/member_credits?line_user_id=eq.${encodeURIComponent(lineUserId)}&select=id,type,amount,expires_at,used,used_at,created_at&order=created_at.desc`,
    { headers: sbHeaders() }
  )
  const records = await res.json()
  return NextResponse.json({ records: Array.isArray(records) ? records : [] })
}
