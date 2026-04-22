'use client'
import { useEffect, useState } from 'react'

type Coupon = {
  id: string
  code: string
  type: 'fixed' | 'percent'
  amount: number
  min_order: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function genCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase()
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: genCode(),
    type: 'fixed' as 'fixed' | 'percent',
    amount: '',
    min_order: '',
    max_uses: '',
    expires_at: '',
  })
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!SUPABASE_URL || !SUPABASE_KEY) return
    const res = await fetch(`${SUPABASE_URL}/rest/v1/coupons?order=created_at.desc`, { headers: sbHeaders() })
    const data = await res.json()
    setCoupons(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`${SUPABASE_URL}/rest/v1/coupons`, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        amount: Number(form.amount),
        min_order: form.min_order ? Number(form.min_order) : 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        active: true,
        used_count: 0,
      }),
    })
    setForm({ code: genCode(), type: 'fixed', amount: '', min_order: '', max_uses: '', expires_at: '' })
    setShowForm(false)
    setSaving(false)
    await load()
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`${SUPABASE_URL}/rest/v1/coupons?id=eq.${coupon.id}`, {
      method: 'PATCH',
      headers: sbHeaders(),
      body: JSON.stringify({ active: !coupon.active }),
    })
    await load()
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">載入中...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl text-gray-800">優惠碼管理</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
        >
          + 新增優惠碼
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 space-y-3">
          <h2 className="font-bold text-gray-700">新增優惠碼</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">優惠碼</label>
              <input
                required
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">折扣類型</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'fixed' | 'percent' }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="fixed">固定金額（NT$）</option>
                <option value="percent">百分比（%）</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {form.type === 'fixed' ? '折抵金額（NT$）' : '折扣百分比（%）'}
              </label>
              <input
                required
                type="number"
                min={1}
                max={form.type === 'percent' ? 100 : undefined}
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">最低消費（NT$，選填）</label>
              <input
                type="number"
                min={0}
                value={form.min_order}
                onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">使用上限（次，選填）</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">到期日（選填）</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
            >
              {saving ? '建立中...' : '建立'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl text-sm border border-gray-200 transition"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-20 text-gray-400">還沒有優惠碼</div>
      ) : (
        <div className="space-y-3">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="font-bold text-gray-800 text-base tracking-wide">{coupon.code}</code>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {coupon.active ? '啟用中' : '已停用'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {coupon.type === 'fixed' ? `折抵 NT$${coupon.amount}` : `打 ${100 - coupon.amount}% 折`}
                  {coupon.min_order > 0 && ` · 滿 NT$${coupon.min_order}`}
                  {coupon.max_uses !== null && ` · 上限 ${coupon.max_uses} 次`}
                  {coupon.expires_at && ` · 到期 ${new Date(coupon.expires_at).toLocaleDateString('zh-TW')}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">已使用 {coupon.used_count} 次</p>
              </div>
              <button
                onClick={() => toggleActive(coupon)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                  coupon.active
                    ? 'border-red-200 text-red-500 hover:bg-red-50'
                    : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {coupon.active ? '停用' : '啟用'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
