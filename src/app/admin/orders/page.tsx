'use client'
import { useEffect, useState } from 'react'
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then(setOrders)
  }, [])

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        還沒有訂單
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">訂單管理</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-bold text-gray-800">{order.customer.name}</span>
                <span className="text-gray-400 text-sm ml-2">{order.customer.phone}</span>
                <p className="text-gray-400 text-xs mt-0.5">{order.id} · {new Date(order.createdAt).toLocaleString('zh-TW')}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2 space-y-0.5">
              {order.items.map((item) => (
                <p key={item.productId}>{item.name} × {item.quantity}  NT${item.price * item.quantity}</p>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="text-xs text-gray-400">
                {order.customer.address}
                {order.customer.note && <span className="ml-2 text-amber-600">備註：{order.customer.note}</span>}
              </div>
              <span className="font-bold text-amber-700">NT${order.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
