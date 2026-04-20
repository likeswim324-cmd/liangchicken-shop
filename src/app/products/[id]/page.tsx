import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Product } from '@/lib/products'
import ProductDetailClient from './ProductDetailClient'

function getProduct(id: string): Product | null {
  const dataPath = path.join(process.cwd(), 'src/data/products.json')
  const products: Product[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  return products.find((p) => p.id === id) ?? null
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  return <ProductDetailClient product={product} />
}
