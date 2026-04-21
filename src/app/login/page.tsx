'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://liangchicken-shop.vercel.app'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    })
  }

  const handleFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    })
  }

  const handleLine = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'line',
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    })
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('已寄送驗證信，請確認信箱後登入！')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('帳號或密碼錯誤')
      } else {
        router.replace('/')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐔</div>
          <h1 className="font-bold text-xl text-gray-800">梁雞商行</h1>
          <p className="text-sm text-gray-400 mt-1">登入後享有會員優惠</p>
        </div>

        {/* Google 登入 */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          使用 Google 登入
        </button>

        {/* Facebook 登入 */}
        <button
          onClick={handleFacebook}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] rounded-xl py-3 text-sm font-medium text-white hover:bg-[#166FE5] transition mb-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          使用 Facebook 登入
        </button>

        {/* LINE 登入 */}
        <button
          onClick={handleLine}
          className="w-full flex items-center justify-center gap-3 bg-[#06C755] rounded-xl py-3 text-sm font-medium text-white hover:bg-[#05b04c] transition mb-3"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.066 2 11.087c0 2.812 1.346 5.322 3.464 7.02.152.126.245.31.256.508l.052 1.59c.016.494.534.814.981.601l1.773-.784a.526.526 0 0 1 .351-.025c.99.272 2.042.419 3.123.419 5.523 0 10-4.066 10-9.087C22 6.066 17.523 2 12 2z"/>
          </svg>
          使用 LINE 登入
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-2">或使用電子信箱</span>
          </div>
        </div>

        {/* 切換登入 / 註冊 */}
        <div className="flex rounded-xl border border-gray-100 mb-4 overflow-hidden">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            登入
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium transition ${mode === 'register' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              required
              placeholder="姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
            />
          )}
          <input
            type="email"
            required
            placeholder="電子信箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
          />
          <input
            type="password"
            required
            placeholder="密碼（至少 6 碼）"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
          </button>
        </form>
      </div>
    </div>
  )
}
