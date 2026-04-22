import { NextResponse } from 'next/server'
import type { Order } from '@/app/api/orders/route'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'missing user_id' }, { status: 400 })
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json([])
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?line_user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
    { headers: sbHeaders() }
  )
  const rows = await res.json()

  const orders: Order[] = (Array.isArray(rows) ? rows : []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    createdAt: r.created_at as string,
    status: r.status as Order['status'],
    customer: r.customer as Order['customer'],
    items: r.items as Order['items'],
    payment: r.payment as string,
    shipping: r.shipping as string,
    total: r.total as number,
  }))

  return NextResponse.json(orders)
}
