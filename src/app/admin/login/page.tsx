'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.ok) {
      router.push('/admin/orders')
      router.refresh()
    } else {
      setError('密碼錯誤，請重試')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐔</div>
          <h1 className="font-bold text-xl text-gray-800">梁雞商行後台</h1>
          <p className="text-sm text-gray-400 mt-1">請輸入管理員密碼</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? '驗證中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
