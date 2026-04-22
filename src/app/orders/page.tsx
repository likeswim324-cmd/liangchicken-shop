'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useLiff } from '@/lib/useLiff'
import type { Order } from '@/app/api/orders/route'

const statusLabel: Record<Order['status'], string> = {
  pending: '待處理',
  processing: '備貨中',
  shipped: '已出貨',
  done: '已完成',
}
const statusColor: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
}
const statusIcon: Record<Order['status'], string> = {
  pending: '🕐',
  processing: '📦',
  shipped: '🚚',
  done: '✅',
}
const paymentLabel: Record<string, string> = {
  linepay: 'LINE Pay',
  credit: '信用卡',
  atm: 'ATM 轉帳',
  cod: '貨到付款',
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { profile } = useLiff()
  const memberId = user?.id ?? profile?.userId ?? null

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!memberId) {
      router.replace('/login')
      return
    }
    fetch(`/api/orders/my?user_id=${encodeURIComponent(memberId)}`)
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [memberId, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← 回首頁</Link>
        <h1 className="font-bold text-xl text-gray-800">我的訂單</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500 mb-2">還沒有訂單紀錄</p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('zh-TW')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">訂單編號：{order.id}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[order.status]}`}>
                  {statusIcon[order.status]} {statusLabel[order.status]}
                </span>
              </div>

              {/* Items */}
              <div className="px-4 py-3 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-gray-500">NT${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">{paymentLabel[order.payment] ?? order.payment}</span>
                <span className="font-bold text-amber-700">NT${order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
