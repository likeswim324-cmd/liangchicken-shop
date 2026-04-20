import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { SUPABASE_URL, useSupabase, sbHeaders } from '@/lib/supabase'

// ── Supabase ──────────────────────────────────────────────────
async function sbUpdate(id: string, body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {}
  if ('name' in body) payload.name = body.name
  if ('description' in body) payload.description = body.description
  if ('price' in body) payload.price = body.price
  if ('unit' in body) payload.unit = body.unit
  if ('image' in body) payload.image = body.image
  if ('category' in body) payload.category = body.category
  if ('inStock' in body) payload.in_stock = body.inStock
  if ('options' in body) payload.options = body.options
  if ('fullDescription' in body) payload.full_description = body.fullDescription
  if ('featured' in body) payload.featured = body.featured

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...sbHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })
  const rows = await res.json()
  return rows[0]
}

async function sbDelete(id: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'DELETE',
    headers: sbHeaders(),
  })
}

// ── 本機 JSON ─────────────────────────────────────────────────
const dataPath = path.join(process.cwd(), 'src/data/products.json')
function read() { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) }
function write(data: unknown) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8') }

// ── Handlers ──────────────────────────────────────────────────
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await req.json()

  if (useSupabase()) {
    const updated = await sbUpdate(id, body)
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const products = read()
  const idx = products.findIndex((p: { id: string }) => p.id === id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
  products[idx] = { ...products[idx], ...body }
  write(products)
  return NextResponse.json(products[idx])
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (useSupabase()) {
    await sbDelete(id)
    return NextResponse.json({ ok: true })
  }

  const products = read()
  write(products.filter((p: { id: string }) => p.id !== id))
  return NextResponse.json({ ok: true })
}
