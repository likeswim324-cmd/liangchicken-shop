import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'src/data/products.json')
function read() { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) }
function write(data: unknown) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8') }

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await req.json()
  const products = read()
  const idx = products.findIndex((p: { id: string }) => p.id === id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
  products[idx] = { ...products[idx], ...body }
  write(products)
  return NextResponse.json(products[idx])
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const products = read()
  write(products.filter((p: { id: string }) => p.id !== id))
  return NextResponse.json({ ok: true })
}
