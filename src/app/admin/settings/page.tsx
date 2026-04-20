'use client'
import { useEffect, useState } from 'react'

type Settings = {
  freeShippingThreshold: number
  shippingFee: number
  storeName: string
  storePhone: string
  lineOfficialAccountId: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return <div className="p-8 text-gray-400 text-center">載入中...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">商店設定</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-bold text-gray-700">基本資料</h2>
          {[
            { key: 'storeName', label: '店名', placeholder: '梁雞商行' },
            { key: 'storePhone', label: '聯絡電話', placeholder: '0912-345-678' },
            { key: 'lineOfficialAccountId', label: 'LINE 官方帳號 ID', placeholder: '@liangchicken' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-gray-600 mb-1 block">{label}</label>
              <input
                value={(settings as unknown as Record<string, string>)[key] ?? ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-bold text-gray-700">運費設定</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">免運門檻（NT$）</label>
              <input
                type="number" min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">運費（NT$）</label>
              <input
                type="number" min={0}
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">訂單滿 NT${settings.freeShippingThreshold} 免運，未滿收 NT${settings.shippingFee} 運費</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition">
          {saved ? '✓ 已儲存' : saving ? '儲存中...' : '儲存設定'}
        </button>
      </form>
    </div>
  )
}
