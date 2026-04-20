'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, X } from 'lucide-react'
import type { ProductOption } from '@/lib/products'

type ProductFormData = {
  id?: string
  name: string
  description: string
  fullDescription?: string
  price: number
  unit: string
  image: string
  category: string
  inStock: boolean
  featured?: boolean
  options?: ProductOption[]
}

export default function AdminProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [form, setForm] = useState<ProductFormData>(
    initial ?? { name: '', description: '', fullDescription: '', price: 0, unit: '', image: '', category: '鮮切雞肉', inStock: true, options: [] }
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newOptionLabel, setNewOptionLabel] = useState('')

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    setForm({ ...form, image: url })
    setUploading(false)
  }

  const addOption = () => {
    if (!newOptionLabel.trim()) return
    const opts = [...(form.options ?? []), { label: newOptionLabel.trim(), choices: [], required: true }]
    setForm({ ...form, options: opts })
    setNewOptionLabel('')
  }

  const removeOption = (idx: number) => {
    const opts = (form.options ?? []).filter((_, i) => i !== idx)
    setForm({ ...form, options: opts })
  }

  const addChoice = (optIdx: number, choice: string) => {
    if (!choice.trim()) return
    const opts = (form.options ?? []).map((opt, i) =>
      i === optIdx ? { ...opt, choices: [...opt.choices, choice.trim()] } : opt
    )
    setForm({ ...form, options: opts })
  }

  const removeChoice = (optIdx: number, choiceIdx: number) => {
    const opts = (form.options ?? []).map((opt, i) =>
      i === optIdx ? { ...opt, choices: opt.choices.filter((_, ci) => ci !== choiceIdx) } : opt
    )
    setForm({ ...form, options: opts })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const endpoint = isEdit ? `/api/products/${form.id}` : '/api/products'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    router.push('/admin/products')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個商品嗎？')) return
    await fetch(`/api/products/${form.id}`, { method: 'DELETE' })
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl mx-auto space-y-4">
      {/* 商品照片 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">商品照片</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-amber-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {form.image
              ? <Image src={form.image} alt="商品" width={96} height={96} className="object-cover w-full h-full" />
              : <span className="text-3xl">🐔</span>}
          </div>
          <div>
            <label className="cursor-pointer inline-block bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium px-4 py-2 rounded-xl transition">
              {uploading ? '上傳中...' : '選擇照片'}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400 mt-1">建議 800×800 px，JPG / PNG</p>
          </div>
        </div>
      </div>

      {/* 基本資料 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-bold text-gray-700">商品資料</h2>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">商品名稱</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            placeholder="例如：土雞腿" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">商品說明</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
            placeholder="簡短描述商品特色..." />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">詳細介紹</label>
          <textarea value={form.fullDescription ?? ''} onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
            rows={8} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-y"
            placeholder="完整的商品介紹、規格、注意事項..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">售價（NT$）</label>
            <input required type="number" min={1} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">單位</label>
            <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
              placeholder="份（約600g）" />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">分類</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400">
            <option>全雞</option>
            <option>雞腿</option>
            <option>雞胸</option>
            <option>雞翅雞腳</option>
            <option>熟食</option>
            <option>雞精湯品</option>
            <option>內臟雜貨</option>
            <option>禮盒</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
            className="accent-amber-500 w-4 h-4" />
          <span className="text-sm text-gray-700">上架販售中</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="accent-amber-500 w-4 h-4" />
          <span className="text-sm text-gray-700">⭐ 顯示在首頁精選</span>
        </label>
      </div>

      {/* 商品選項 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div>
          <h2 className="font-bold text-gray-700">處理方式 / 規格選項</h2>
          <p className="text-xs text-gray-400 mt-0.5">例如：切法、大小、是否去骨</p>
        </div>

        {(form.options ?? []).map((opt, optIdx) => (
          <div key={optIdx} className="border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{opt.label}</span>
              <button type="button" onClick={() => removeOption(optIdx)} className="text-gray-300 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opt.choices.map((choice, ci) => (
                <span key={ci} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full">
                  {choice}
                  <button type="button" onClick={() => removeChoice(optIdx, ci)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <AddChoiceInput onAdd={(val) => addChoice(optIdx, val)} />
          </div>
        ))}

        {/* 新增選項類別 */}
        <div className="flex gap-2">
          <input
            value={newOptionLabel}
            onChange={(e) => setNewOptionLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
            placeholder="新增選項名稱，例如：切法"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
          <button type="button" onClick={addOption}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition">
          {saving ? '儲存中...' : isEdit ? '儲存修改' : '新增商品'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition">
            刪除
          </button>
        )}
      </div>
    </form>
  )
}

function AddChoiceInput({ onAdd }: { onAdd: (val: string) => void }) {
  const [val, setVal] = useState('')
  const submit = () => { if (val.trim()) { onAdd(val); setVal('') } }
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        placeholder="新增選項，例如：切塊"
        className="flex-1 border border-dashed border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-300"
      />
      <button type="button" onClick={submit} className="text-xs text-amber-600 hover:text-amber-700 px-2">+ 新增</button>
    </div>
  )
}
