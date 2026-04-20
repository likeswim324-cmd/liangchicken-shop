'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLiff } from '@/lib/useLiff'
import { useAuth } from '@/lib/useAuth'

type PaymentMethod = 'linepay' | 'credit' | 'atm' | 'cod'
type Credit = { id: string; type: 'welcome' | 'birthday' | 'referral'; amount: number; expires_at: string }

const paymentOptions: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'linepay', label: 'LINE Pay', icon: '💚', desc: '直接在 LINE 完成付款' },
  { id: 'credit', label: '信用卡', icon: '💳', desc: 'VISA / Master / JCB' },
  { id: 'atm', label: 'ATM 轉帳', icon: '🏦', desc: '付款後提供帳號，3 日內轉帳' },
  { id: 'cod', label: '貨到付款', icon: '💵', desc: '收到貨再付現金' },
]

const FREE_SHIPPING = 2000
const SHIPPING_FEE = 120

const CREDIT_LABELS: Record<string, string> = {
  welcome: '入會禮',
  birthday: '生日禮',
  referral: '推薦獎金',
}
const CREDIT_MIN: Record<string, number> = {
  welcome: 500,
  birthday: 1000,
  referral: 500,
}

function getEstimatedDelivery(): string {
  const date = new Date()
  date.setDate(date.getDate() + 3)
  if (date.getDay() === 0) date.setDate(date.getDate() + 1)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatExpiry(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} 到期`
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const { profile } = useLiff()
  const { user, displayName: authDisplayName } = useAuth()
  // 統一 member ID：優先用 Supabase Auth user ID，其次用 LINE userId
  const memberId = user?.id ?? profile?.userId ?? null

  const [payment, setPayment] = useState<PaymentMethod>('linepay')
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [loading, setLoading] = useState(false)

  const [hydrated, setHydrated] = useState(false)

  // 會員相關
  const [isNewMember, setIsNewMember] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [credits, setCredits] = useState<Credit[]>([])
  const [selectedCreditIds, setSelectedCreditIds] = useState<string[]>([])

  useEffect(() => { setHydrated(true) }, [])

  // 擷取推薦碼（從 URL 或 localStorage）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) localStorage.setItem('lc_ref', ref)
    const stored = localStorage.getItem('lc_ref')
    if (stored) setReferralCode(stored)
  }, [])

  // 帶入姓名欄：優先 Supabase Auth 名字，其次 LINE 名字
  useEffect(() => {
    const name = authDisplayName ?? profile?.displayName
    if (name && !form.name) {
      setForm(f => ({ ...f, name }))
    }
  }, [profile, authDisplayName])

  // 取得 / 建立會員資料（Supabase Auth 或 LIFF 皆支援）
  useEffect(() => {
    if (!memberId) return
    const displayName = authDisplayName ?? profile?.displayName ?? ''
    fetch('/api/members/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line_user_id: memberId,
        display_name: displayName,
        referred_by_code: referralCode || undefined,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.is_new) setIsNewMember(true)
        return fetch(`/api/members/credits?line_user_id=${memberId}`)
      })
      .then(r => r.json())
      .then(data => setCredits(data.credits ?? []))
  }, [memberId])

  if (hydrated && items.length === 0) {
    router.replace('/products')
    return null
  }
  if (!hydrated) return null

  const subtotal = totalPrice()
  const freeShip = subtotal >= FREE_SHIPPING
  const shippingFee = freeShip ? 0 : SHIPPING_FEE
  const baseTotal = subtotal + shippingFee
  const estimatedDelivery = getEstimatedDelivery()

  // 計算折抵金額
  const creditDiscount = credits
    .filter(c => selectedCreditIds.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0)
  const grandTotal = Math.max(0, baseTotal - creditDiscount)

  // 點數選擇邏輯
  function toggleCredit(credit: Credit) {
    const alreadySelected = selectedCreditIds.includes(credit.id)
    if (alreadySelected) {
      setSelectedCreditIds(ids => ids.filter(id => id !== credit.id))
      return
    }
    // 入會禮和生日禮互斥
    const hasWelcome = credits.some(c => c.type === 'welcome' && selectedCreditIds.includes(c.id))
    const hasBirthday = credits.some(c => c.type === 'birthday' && selectedCreditIds.includes(c.id))
    if (credit.type === 'welcome' && hasBirthday) return
    if (credit.type === 'birthday' && hasWelcome) return
    // 檢查最低消費
    if (baseTotal < CREDIT_MIN[credit.type]) return
    setSelectedCreditIds(ids => [...ids, credit.id])
  }

  function creditDisabled(credit: Credit): { disabled: boolean; reason: string } {
    if (baseTotal < CREDIT_MIN[credit.type]) {
      return { disabled: true, reason: `需滿 NT$${CREDIT_MIN[credit.type]}` }
    }
    const hasWelcome = credits.some(c => c.type === 'welcome' && selectedCreditIds.includes(c.id))
    const hasBirthday = credits.some(c => c.type === 'birthday' && selectedCreditIds.includes(c.id))
    if (credit.type === 'welcome' && hasBirthday) return { disabled: true, reason: '不可與生日禮併用' }
    if (credit.type === 'birthday' && hasWelcome) return { disabled: true, reason: '不可與入會禮併用' }
    return { disabled: false, reason: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 若新會員有填生日，先更新
      if (isNewMember && birthday && memberId) {
        await fetch('/api/members/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: memberId, birthday }),
        })
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          form,
          payment,
          shipping: 'frozen',
          total: grandTotal,
          line_user_id: memberId ?? undefined,
          used_credit_ids: selectedCreditIds,
          credit_discount: creditDiscount,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        clearCart()
        localStorage.removeItem('lc_ref')
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

          {/* 新會員填生日 */}
          {isNewMember && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-sm font-medium text-amber-800 mb-2">🎉 歡迎加入梁雞商行！填入生日，以後生日月可領 NT$100 生日禮</p>
              <label className="text-sm text-gray-600 mb-1 block">生日（選填）</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
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

        {/* 會員點數 */}
        {credits.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 mb-3">會員點數折抵</h2>
            <div className="space-y-2">
              {credits.map((credit) => {
                const selected = selectedCreditIds.includes(credit.id)
                const { disabled, reason } = creditDisabled(credit)
                return (
                  <button
                    key={credit.id}
                    type="button"
                    onClick={() => toggleCredit(credit)}
                    disabled={disabled && !selected}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      selected
                        ? 'border-amber-400 bg-amber-50'
                        : disabled
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-100 hover:border-amber-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{CREDIT_LABELS[credit.type]} — NT${credit.amount} 折抵</p>
                        <p className="text-xs text-gray-400">{formatExpiry(credit.expires_at)}{reason && ` · ${reason}`}</p>
                      </div>
                    </div>
                    {selected && <span className="text-amber-600 font-bold text-sm">-NT${credit.amount}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
            {creditDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>點數折抵</span>
                <span>-NT${creditDiscount}</span>
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
