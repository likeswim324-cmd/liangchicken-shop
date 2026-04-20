import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { SUPABASE_URL, useSupabase, sbHeaders } from '@/lib/supabase'

type Settings = {
  freeShippingThreshold: number
  shippingFee: number
  storeName: string
  storePhone: string
  lineOfficialAccountId: string
}

// ── Supabase ──────────────────────────────────────────────────
async function sbGet(): Promise<Settings | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, { headers: sbHeaders() })
  const rows = await res.json()
  if (!rows[0]) return null
  const r = rows[0]
  return {
    freeShippingThreshold: r.free_shipping_threshold,
    shippingFee: r.shipping_fee,
    storeName: r.store_name,
    storePhone: r.store_phone,
    lineOfficialAccountId: r.line_official_account_id,
  }
}

async function sbUpsert(data: Settings) {
  await fetch(`${SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
    method: 'PATCH',
    headers: { ...sbHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({
      free_shipping_threshold: data.freeShippingThreshold,
      shipping_fee: data.shippingFee,
      store_name: data.storeName,
      store_phone: data.storePhone,
      line_official_account_id: data.lineOfficialAccountId,
    }),
  })
}

// ── 本機 JSON ─────────────────────────────────────────────────
const dataPath = path.join(process.cwd(), 'src/data/settings.json')
function read(): Settings { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) }
function write(data: Settings) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8') }

// ── Handlers ──────────────────────────────────────────────────
export async function GET() {
  if (useSupabase()) {
    const s = await sbGet()
    return NextResponse.json(s ?? read())
  }
  return NextResponse.json(read())
}

export async function PUT(req: Request) {
  const body = await req.json()

  if (useSupabase()) {
    const current = await sbGet() ?? read()
    const updated = { ...current, ...body } as Settings
    await sbUpsert(updated)
    return NextResponse.json(updated)
  }

  const updated = { ...read(), ...body } as Settings
  write(updated)
  return NextResponse.json(updated)
}
