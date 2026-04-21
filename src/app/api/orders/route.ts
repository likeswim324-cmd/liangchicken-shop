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

// ── LINE 通知 ─────────────────────────────────────────────────
async function sendLineNotification(order: Order) {
  const channelId = process.env.LINE_CHANNEL_ID
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  const ownerUserId = process.env.LINE_OWNER_USER_ID
  console.log('[LINE] channelId:', channelId ? 'OK' : 'MISSING', 'secret:', channelSecret ? 'OK' : 'MISSING', 'userId:', ownerUserId ?? 'MISSING')
  if (!channelId || !channelSecret || !ownerUserId) return

  // 取得 stateless channel access token
  const tokenRes = await fetch('https://api.line.me/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: channelId,
      client_secret: channelSecret,
    }),
  })
  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token
  console.log('[LINE] token:', accessToken ? 'OK' : 'FAILED', JSON.stringify(tokenData))
  if (!accessToken) return

  const itemLines = order.items.map(i => {
    const opts = i.selectedOptions ? Object.entries(i.selectedOptions).filter(([k]) => k !== '份量').map(([k, v]) => `  ${k}：${v}`).join('\n') : ''
    return `・${i.name} x${i.quantity}${opts ? '\n' + opts : ''}`
  }).join('\n')
  const shippingLabel = order.shipping === 'frozen' ? '冷凍宅配' : order.shipping === 'fresh' ? '溫體宅配' : order.shipping
  const note = order.customer.note ? `\n備註：${order.customer.note}` : ''
  const message = `🛒 新訂單！${order.id}\n\n👤 客戶：${order.customer.name}\n📞 電話：${order.customer.phone}\n📦 配送：${shippingLabel}\n🏠 地址：${order.customer.address}${note}\n\n${itemLines}\n\n💰 金額：$${order.total}\n💳 付款：${order.payment}`

  const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ to: ownerUserId, messages: [{ type: 'text', text: message }] }),
  })
  console.log('[LINE] push result:', await pushRes.text())
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

async function sbInsertOrder(order: Order & { line_user_id?: string }) {
  await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify({
      id: order.id, created_at: order.createdAt, status: order.status,
      customer: order.customer, items: order.items, payment: order.payment,
      shipping: order.shipping, total: order.total,
      line_user_id: order.line_user_id ?? null,
    }),
  })
}

async function issueCredit(line_user_id: string, type: string, amount: number, days: number) {
  const expires_at = new Date(Date.now() + days * 86400_000).toISOString()
  await fetch(`${SUPABASE_URL}/rest/v1/member_credits`, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ line_user_id, type, amount, expires_at }),
  })
}

async function handleMemberCredits(line_user_id: string, orderId: string, used_credit_ids: string[]) {
  // 標記已使用的點數
  if (used_credit_ids.length > 0) {
    const used_at = new Date().toISOString()
    for (const id of used_credit_ids) {
      await fetch(`${SUPABASE_URL}/rest/v1/member_credits?id=eq.${id}`, {
        method: 'PATCH',
        headers: sbHeaders(),
        body: JSON.stringify({ used: true, used_at, order_id: orderId }),
      })
    }
  }

  // 確認是否為第一筆訂單，且推薦獎金尚未發放
  const mRes = await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(line_user_id)}&select=referred_by,referral_credited`,
    { headers: sbHeaders() }
  )
  const members = await mRes.json()
  const member = members[0]
  if (!member || member.referral_credited) return

  // 查此用戶先前訂單數（不含本次）
  const oRes = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?line_user_id=eq.${encodeURIComponent(line_user_id)}&id=neq.${orderId}&select=id`,
    { headers: sbHeaders() }
  )
  const prevOrders = await oRes.json()
  if (!Array.isArray(prevOrders) || prevOrders.length > 0) return

  // 第一筆訂單：發推薦獎金
  if (member.referred_by) {
    await issueCredit(line_user_id, 'referral', 50, 30)
    await issueCredit(member.referred_by, 'referral', 50, 30)
  }
  await fetch(
    `${SUPABASE_URL}/rest/v1/members?line_user_id=eq.${encodeURIComponent(line_user_id)}`,
    { method: 'PATCH', headers: sbHeaders(), body: JSON.stringify({ referral_credited: true }) }
  )
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

  const order: Order & { line_user_id?: string } = {
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
    line_user_id: body.line_user_id ?? undefined,
  }

  if (SUPABASE_URL && SUPABASE_KEY) {
    await sbInsertOrder(order)
    if (body.line_user_id) {
      await handleMemberCredits(body.line_user_id, orderId, body.used_credit_ids ?? [])
    }
  } else {
    const orders = readOrders()
    orders.unshift(order)
    writeOrders(orders)
  }

  await sendLineNotification(order).catch(() => {})

  return NextResponse.json({ ok: true, orderId })
}

export async function GET() {
  if (SUPABASE_URL && SUPABASE_KEY) {
    return NextResponse.json(await sbGetOrders())
  }
  return NextResponse.json(readOrders())
}
