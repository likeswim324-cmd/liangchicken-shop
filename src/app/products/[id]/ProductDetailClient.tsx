'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/lib/products'

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCartStore()
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)
  const [descOpen, setDescOpen] = useState(true)

  const handleAdd = () => {
    const missing = (product.options ?? []).filter((o) => o.required && !selected[o.label])
    if (missing.length > 0) { setError('請先選擇所有必填選項'); return }
    addItem(product, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600">
          <ChevronLeft className="w-4 h-4" />
          所有商品
        </Link>
        <Link href={`/admin/products/${product.id}`} className="text-xs text-gray-400 hover:text-amber-600 border border-gray-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition">
          ✏️ 編輯此商品
        </Link>
      </div>

      {/* 商品圖片 */}
      <div className="bg-amber-50 rounded-2xl overflow-hidden aspect-square w-full max-w-sm mx-auto mb-6 flex items-center justify-center">
        {product.image
          ? <Image src={product.image} alt={product.name} width={400} height={400} className="object-cover w-full h-full" />
          : <span className="text-8xl">🐔</span>}
      </div>

      {/* 標題 & 價格 */}
      <div className="mb-4">
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{product.category}</span>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{product.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{product.description}</p>
        <p className="text-amber-700 font-bold text-xl mt-2">NT${product.price} <span className="text-sm font-normal text-gray-400">/ {product.unit}</span></p>
        {!product.inStock && <p className="text-red-500 text-sm mt-1">目前無庫存</p>}
      </div>

      {/* 規格選項 */}
      {(product.options ?? []).length > 0 && (
        <div className="mb-4 space-y-3">
          {product.options!.map((opt) => (
            <div key={opt.label}>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                {opt.label}
                {opt.required && <span className="text-red-400 ml-1">*</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {opt.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => { setSelected({ ...selected, [opt.label]: choice }); setError('') }}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition ${
                      selected[opt.label] === choice
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-gray-200 text-gray-600 hover:border-amber-400'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* 加入購物車 */}
      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 mb-6"
      >
        <ShoppingCart className="w-5 h-5" />
        {added ? '已加入！' : product.inStock ? '加入購物車' : '目前無庫存'}
      </button>

      {/* 詳細介紹 */}
      {product.fullDescription && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setDescOpen(!descOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
          >
            商品詳細介紹
            {descOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {descOpen && (
            <div className="px-4 pb-4 text-sm text-gray-600 whitespace-pre-line border-t border-gray-100 pt-3">
              {product.fullDescription}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
