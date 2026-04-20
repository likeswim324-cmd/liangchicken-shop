import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export type Order = {
  id: string
  createdAt: string
  status: 'pending' | 'processing' | 'shipped' | 'done'
  customer: { name: string; phone: string; address: string; note: string }
  items: { productId: string; name: string; price: number; quantity: number; selectedOptions?: Record<string, string> }[]
  payment: string
  shipping: string
  total: number
}

// ── Supabase（線上環境）──────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

function sbHeaders() {
  return { 'apikey': SUPABASE_KEY!, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }
}

async function sbGetOrders(): Promise<Order[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, { headers: sbHeaders() })
  const rows = await res.json()
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id, createdAt: r.created_at, status: r.status,
    customer: r.customer, items: r.items, payment: r.payment, shipping: r.shipping, total: r.total,
  }))
}

async function sbInsertOrder(order: Order) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify({
      id: order.id, created_at: order.createdAt, status: order.status,
      customer: order.customer, items: order.items, payment: order.payment, shipping: order.shipping, total: order.total,
    }),
  })
}

// ── 本機開發：JSON 檔案 ──────────────────────────────────────
const dataPath = path.join(process.cwd(), 'src/data/orders.json')

function readOrders(): Order[] {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}
function writeOrders(orders: Order[]) {
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2), 'utf-8')
}

// ── API Handlers ─────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json()
  const orderId = `LC${Date.now()}`

  const order: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    customer: body.form,
    items: body.items.map((i: { product: { id: string; name: string; price: number }; quantity: number; selectedOptions?: Record<string, string> }) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      selectedOptions: i.selectedOptions ?? {},
    })),
    payment: body.payment,
    shipping: body.shipping ?? 'frozen',
    total: body.total,
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    await sbInsertOrder(order)
  } else {
    const orders = readOrders()
    orders.unshift(order)
    writeOrders(orders)
  }

  return NextResponse.json({ ok: true, orderId })
}

export async function GET() {
  if (SUPABASE_URL && SUPABASE_KEY) {
    return NextResponse.json(await sbGetOrders())
  }
  return NextResponse.json(readOrders())
}
