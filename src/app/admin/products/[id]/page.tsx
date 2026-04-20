import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import AdminProductForm from '@/components/AdminProductForm'

function getProduct(id: string) {
  const dataPath = path.join(process.cwd(), 'src/data/products.json')
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  return products.find((p: { id: string }) => p.id === id) ?? null
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">編輯商品</h1>
      <AdminProductForm initial={product} />
    </div>
  )
}
