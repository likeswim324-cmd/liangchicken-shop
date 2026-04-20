'use client'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">購物車是空的</h2>
        <p className="text-gray-400 text-sm mb-6">去選幾樣好料回來吧！</p>
        <Link href="/products" className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition">
          去選購
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">購物車</h1>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity, selectedOptions, cartKey }) => (
          <div key={cartKey} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-3xl w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">🐔</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{product.name}</p>
              {Object.entries(selectedOptions ?? {}).filter(([, v]) => v).map(([k, v]) => (
                <span key={k} className="inline-block text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mr-1 mt-0.5">{v}</span>
              ))}
              <p className="text-amber-700 font-bold text-sm mt-0.5">NT${product.price} / {product.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(cartKey, quantity - 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(cartKey, quantity + 1)}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <p className="text-gray-800 font-bold text-sm w-16 text-right">NT${product.price * quantity}</p>
            <button onClick={() => removeItem(cartKey)} className="text-gray-300 hover:text-red-400 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 合計 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>小計</span>
          <span>NT${totalPrice()}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>運費</span>
          <span className="text-green-600">免運（滿 $2,000）</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-bold text-gray-800">
          <span>總計</span>
          <span className="text-amber-700 text-lg">NT${totalPrice()}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center font-bold py-4 rounded-2xl transition"
      >
        前往結帳
      </Link>
    </div>
  )
}
