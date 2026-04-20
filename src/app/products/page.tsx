import fs from 'fs'
import path from 'path'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/products'

const categories = ['全部', '全雞', '雞腿', '雞胸', '雞翅雞腳', '熟食', '雞精湯品', '內臟雜貨', '禮盒'] as const

function getProducts(): Product[] {
  const dataPath = path.join(process.cwd(), 'src/data/products.json')
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const products = getProducts()
  const active = searchParams.category ?? '全部'
  const filtered = active === '全部' ? products : products.filter((p) => p.category === active)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">所有商品</h1>

      {/* 分類篩選 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`/products${cat === '全部' ? '' : `?category=${cat}`}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              active === cat
                ? 'bg-amber-600 text-white border-amber-600'
                : 'text-gray-600 border-gray-200 hover:border-amber-400'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* 商品格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
