import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import Image from 'next/image'

type Product = { id: string; name: string; price: number; category: string; inStock: boolean; image: string; unit: string }

function getProducts(): Product[] {
  const dataPath = path.join(process.cwd(), 'src/data/products.json')
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}

export default function AdminProductsPage() {
  const products = getProducts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-gray-800">商品管理</h1>
        <Link href="/admin/products/new"
          className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          + 新增商品
        </Link>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-amber-200 transition">
            <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {p.image
                ? <Image src={p.image} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                : <span className="text-2xl">🐔</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-400">{p.category} · {p.unit}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-amber-700">NT${p.price}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {p.inStock ? '販售中' : '已下架'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
