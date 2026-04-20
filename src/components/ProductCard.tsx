'use client'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/lib/products'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    product.options?.forEach((opt) => { init[opt.label] = '' })
    return init
  })
  const [error, setError] = useState('')

  const allSelected = !product.options?.length ||
    product.options.every((opt) => !opt.required || selected[opt.label])

  const handleAdd = () => {
    if (!allSelected) {
      setError('請選擇所有必填選項')
      return
    }
    setError('')
    addItem(product, selected)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* 商品圖 */}
      <div className="bg-amber-50 h-44 flex items-center justify-center overflow-hidden">
        {product.image
          ? <Image src={product.image} alt={product.name} width={176} height={176} className="object-cover w-full h-full" />
          : <span className="text-5xl">🐔</span>
        }
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-amber-600 font-medium mb-1">{product.category}</span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-800 text-base mb-1 hover:text-amber-600 transition">{product.name}</h3>
        </Link>
        <p className="text-gray-500 text-sm mb-3">{product.description}</p>

        {/* 選項 */}
        {product.options?.map((opt) => (
          <div key={opt.label} className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5">
              {opt.label}{opt.required && <span className="text-red-400 ml-0.5">*</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opt.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    setSelected({ ...selected, [opt.label]: choice })
                    setError('')
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    selected[opt.label] === choice
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'text-gray-600 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

        {/* 價格 + 加入購物車 */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-amber-700 font-bold text-lg">NT${product.price}</span>
            <span className="text-gray-400 text-xs ml-1">/ {product.unit}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? '已加入' : '加入'}
          </button>
        </div>
      </div>
    </div>
  )
}
