'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useLiff } from '@/lib/useLiff'
import type { CreditRecord } from '@/app/api/members/credits/history/route'

const CREDIT_LABELS: Record<string, string> = {
  welcome: '🎁 入會禮',
  birthday: '🎂 生日禮',
  referral: '🤝 推薦獎金',
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.liangchicken.com.tw'

type Member = {
  line_user_id: string
  display_name: string
  referral_code: string
  birthday: string | null
  created_at: string
}

export default function MemberPage() {
  const router = useRouter()
  const { user, loading: authLoading, displayName } = useAuth()
  const { profile } = useLiff()
  const memberId = user?.id ?? profile?.userId ?? null

  const [member, setMember] = useState<Member | null>(null)
  const [activeCredits, setActiveCredits] = useState<{ amount: number }[]>([])
  const [history, setHistory] = useState<CreditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!memberId) { router.replace('/login'); return }

    Promise.all([
      fetch(`/api/members/me?line_user_id=${encodeURIComponent(memberId)}`).then(r => r.json()),
      fetch(`/api/members/credits?line_user_id=${encodeURIComponent(memberId)}`).then(r => r.json()),
      fetch(`/api/members/credits/history?line_user_id=${encodeURIComponent(memberId)}`).then(r => r.json()),
    ]).then(([memberData, creditsData, historyData]) => {
      setMember(memberData.member ?? null)
      setActiveCredits(creditsData.credits ?? [])
      setHistory(historyData.records ?? [])
      setLoading(false)
    })
  }, [memberId, authLoading, router])

  const totalPoints = activeCredits.reduce((sum, c) => sum + c.amount, 0)

  const copyReferral = () => {
    if (!member) return
    const link = `${SITE_URL}/checkout?ref=${member.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    )
  }

  const name = member?.display_name ?? displayName ?? '會員'
  const joinDate = member?.created_at
    ? new Date(member.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← 回首頁</Link>
        <h1 className="font-bold text-xl text-gray-800">會員中心</h1>
      </div>

      {/* 頭像 + 名字 */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-lg">{name}</p>
          {joinDate && <p className="text-amber-100 text-xs mt-0.5">加入於 {joinDate}</p>}
        </div>
      </div>

      {/* 點數餘額 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <p className="text-sm text-gray-500 mb-1">可用點數</p>
        <p className="text-4xl font-bold text-amber-600">NT${totalPoints}</p>
        {totalPoints === 0 && (
          <p className="text-xs text-gray-400 mt-1">購物滿額即可獲得點數折抵優惠</p>
        )}
      </div>

      {/* 推薦碼 */}
      {member?.referral_code && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">推薦連結</p>
          <p className="text-xs text-gray-400 mb-3">朋友透過你的連結下第一筆單，雙方各得 NT$50 點數</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 truncate">
              {SITE_URL}/checkout?ref={member.referral_code}
            </code>
            <button
              onClick={copyReferral}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
            >
              {copied ? '已複製！' : '複製'}
            </button>
          </div>
        </div>
      )}

      {/* 快捷連結 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link
          href="/orders"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:border-amber-200 transition"
        >
          <div className="text-2xl mb-1">📦</div>
          <p className="text-sm font-medium text-gray-700">我的訂單</p>
        </Link>
        <Link
          href="/products"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:border-amber-200 transition"
        >
          <div className="text-2xl mb-1">🛒</div>
          <p className="text-sm font-medium text-gray-700">去購物</p>
        </Link>
      </div>

      {/* 點數紀錄 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">點數紀錄</p>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">尚無點數紀錄</p>
        ) : (
          <div className="space-y-3">
            {history.map((r) => {
              const now = new Date()
              const expired = !r.used && new Date(r.expires_at) <= now
              const status = r.used ? 'used' : expired ? 'expired' : 'active'
              return (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">{CREDIT_LABELS[r.type] ?? r.type}</p>
                    <p className="text-xs text-gray-400">
                      {status === 'active' && `到期：${new Date(r.expires_at).toLocaleDateString('zh-TW')}`}
                      {status === 'used' && `已使用 · ${r.used_at ? new Date(r.used_at).toLocaleDateString('zh-TW') : ''}`}
                      {status === 'expired' && '已過期'}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${
                    status === 'active' ? 'text-amber-600' : 'text-gray-300'
                  }`}>
                    {status === 'active' ? `+NT$${r.amount}` : `-NT$${r.amount}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
