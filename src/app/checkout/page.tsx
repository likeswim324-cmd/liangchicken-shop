'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type PaymentMethod = 'linepay' | 'credit' | 'atm' | 'cod'

const paymentOptions: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'linepay', label: 'LINE Pay', icon: '💚', desc: '直接在 LINE 完成付款' },
  { id: 'credit', label: '信用卡', icon: '💳', desc: 'VISA / Master / JCB' },
  { id: 'atm', label: 'ATM 轉帳', icon: '🏦', desc: '付款後提供帳號，3 日內轉帳' },
  { id: 'cod', label: '貨到付款', icon: '💵', desc: '收到貨再付現金' },
]

const FREE_SHIPPING = 2000
const SHIPPING_FEE = 120

function getEstimatedDelivery(): string {
  const date = new Date()
  date.setDate(date.getDate() + 3)
  // 若落在週日，再延一天
  if (date.getDay() === 0) date.setDate(date.getDate() + 1)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentMethod>('linepay')
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    router.replace('/products')
    return null
  }

  const subtotal = totalPrice()
  const freeShip = subtotal >= FREE_SHIPPING
  const shippingFee = freeShip ? 0 : SHIPPING_FEE
  const grandTotal = subtotal + shippingFee
  const estimatedDelivery = getEstimatedDelivery()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, form, payment, shipping: 'frozen', total: grandTotal }),
      })
      const data = await res.json()
      if (data.ok) {
        clearCart()
        router.push(`/checkout/success?order=${data.orderId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">填寫資料</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* 收件資料 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-bold text-gray-700">收件資料</h2>
          {[
            { key: 'name', label: '姓名', placeholder: '王小明', type: 'text' },
            { key: 'phone', label: '手機', placeholder: '0912-345-678', type: 'tel' },
            { key: 'address', label: '地址', placeholder: '桃園市...', type: 'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-sm text-gray-600 mb-1 block">{label}</label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">備註（選填）</label>
            <textarea
              placeholder="例如：請幫我切塊、下午才在家..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* 配送資訊 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">配送資訊</h2>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-2xl">🧊</span>
            <div>
              <p className="font-medium text-sm text-gray-800">黑貓宅急便 — 冷凍宅配</p>
              <p className="text-xs text-gray-500 mt-0.5">預計到貨：<span className="text-amber-700 font-medium">{estimatedDelivery}</span>（下單後 3 個工作天）</p>
            </div>
          </div>
        </div>

        {/* 付款方式 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">付款方式</h2>
          <div className="space-y-2">
            {paymentOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  payment === opt.id ? 'border-amber-400 bg-amber-50' : 'border-gray-100 hover:border-amber-200'
                }`}
              >
                <input type="radio" name="payment" value={opt.id} checked={payment === opt.id}
                  onChange={() => setPayment(opt.id)} className="accent-amber-500" />
                <span className="text-xl">{opt.icon}</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 訂單摘要 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">訂單摘要</h2>
          {items.map(({ product, quantity, cartKey }) => (
            <div key={cartKey} className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{product.name} × {quantity}</span>
              <span>NT${product.price * quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>小計</span>
              <span>NT${subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>運費</span>
              {freeShip
                ? <span className="text-green-600">免運（滿 ${FREE_SHIPPING}）</span>
                : <span>NT${SHIPPING_FEE}</span>}
            </div>
            {!freeShip && (
              <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2.5 mt-2">
                <p className="text-xs text-amber-700">
                  再買 <span className="font-bold">NT${FREE_SHIPPING - subtotal}</span> 即可免運！
                </p>
                <Link href="/products" className="text-xs font-medium text-amber-600 hover:text-amber-700 underline underline-offset-2 whitespace-nowrap ml-3">
                  繼續選購 →
                </Link>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-100">
              <span>總計</span>
              <span className="text-amber-700">NT${grandTotal}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-4 rounded-2xl transition"
        >
          {loading ? '處理中...' : '確認送出訂單'}
        </button>
      </form>
    </div>
  )
}
