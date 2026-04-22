import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY, sbHeaders } from '@/lib/supabase'

export type CouponResult = {
  valid: boolean
  type?: 'fixed' | 'percent'
  amount?: number
  discount?: number
  error?: string
}

export async function POST(req: Request) {
  const { code, order_total, user_id } = await req.json() as { code: string; order_total: number; user_id?: string }

  if (!code || !SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ valid: false, error: '無效的優惠碼' })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/coupons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=*`,
    { headers: sbHeaders() }
  )
  const rows = await res.json()
  const coupon = rows[0]

  if (!coupon) return NextResponse.json({ valid: false, error: '優惠碼不存在' })
  if (!coupon.active) return NextResponse.json({ valid: false, error: '優惠碼已停用' })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: '優惠碼已過期' })
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: '優惠碼已達使用上限' })
  }
  if (coupon.min_order && order_total < coupon.min_order) {
    return NextResponse.json({ valid: false, error: `訂單需滿 NT$${coupon.min_order} 才可使用` })
  }

  // 每人限用一次
  if (user_id) {
    const usedRes = await fetch(
      `${SUPABASE_URL}/rest/v1/coupon_uses?coupon_id=eq.${coupon.id}&user_id=eq.${encodeURIComponent(user_id)}&select=id`,
      { headers: sbHeaders() }
    )
    const used = await usedRes.json()
    if (Array.isArray(used) && used.length > 0) {
      return NextResponse.json({ valid: false, error: '你已經使用過這組優惠碼了' })
    }
  }

  const discount = coupon.type === 'percent'
    ? Math.floor(order_total * coupon.amount / 100)
    : coupon.amount

  return NextResponse.json({
    valid: true,
    coupon_id: coupon.id,
    type: coupon.type,
    amount: coupon.amount,
    discount,
  })
}
