import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { SUPABASE_URL, useSupabase, sbHeaders } from '@/lib/supabase'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  unit: string
  image: string
  category: string
  inStock: boolean
  featured?: boolean
  options: { label: string; choices: string[]; required: boolean }[]
  fullDescription?: string
}

// ── Supabase ──────────────────────────────────────────────────
async function sbGetProducts(): Promise<Product[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?order=id.asc`, { headers: sbHeaders() })
  const rows = await res.json()
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    unit: r.unit,
    image: r.image,
    category: r.category,
    inStock: r.in_stock,
    featured: r.featured ?? false,
    options: r.options,
    fullDescription: r.full_description ?? '',
  }))
}

async function sbInsertProduct(product: Omit<Product, 'id'> & { id: string }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      image: product.image,
      category: product.category,
      in_stock: product.inStock,
      featured: product.featured ?? false,
      options: product.options,
      full_description: product.fullDescription ?? '',
    }),
  })
  const rows = await res.json()
  return rows[0]
}

// ── 本機 JSON ─────────────────────────────────────────────────
const dataPath = path.join(process.cwd(), 'src/data/products.json')
function read() { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) }
function write(data: unknown) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8') }

// ── Handlers ──────────────────────────────────────────────────
export async function GET() {
  if (useSupabase()) return NextResponse.json(await sbGetProducts())
  return NextResponse.json(read())
}

export async function POST(req: Request) {
  const body = await req.json()
  const newId = `p${Date.now()}`

  if (useSupabase()) {
    const created = await sbInsertProduct({ ...body, id: newId })
    return NextResponse.json(created)
  }

  const products = read()
  const newProduct = { ...body, id: newId }
  products.push(newProduct)
  write(products)
  return NextResponse.json(newProduct)
}
