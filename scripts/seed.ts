/**
 * 將 src/data/products.json 的 34 個商品匯入 Supabase
 * 使用方式：
 *   1. 確認 .env.local 已填入 SUPABASE_URL 和 SUPABASE_ANON_KEY
 *   2. npx tsx scripts/seed.ts
 */

import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 請先設定 SUPABASE_URL 和 SUPABASE_ANON_KEY 環境變數')
  console.error('   可以在 .env.local 填入，然後用：')
  console.error('   source .env.local && npx tsx scripts/seed.ts')
  process.exit(1)
}

const products = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/products.json'), 'utf-8')
)

const rows = products.map((p: {
  id: string
  name: string
  description: string
  price: number
  unit: string
  image: string
  category: string
  inStock: boolean
  options: unknown[]
  fullDescription?: string
}) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  unit: p.unit,
  image: p.image,
  category: p.category,
  in_stock: p.inStock,
  options: p.options,
  full_description: p.fullDescription ?? '',
}))

async function seed() {
  console.log(`📦 準備匯入 ${rows.length} 個商品...`)

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('❌ 匯入失敗：', err)
    process.exit(1)
  }

  console.log('✅ 商品匯入成功！')
}

seed()
