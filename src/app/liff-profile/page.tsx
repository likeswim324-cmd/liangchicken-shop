'use client'
import { useEffect, useState } from 'react'


export default function LiffProfilePage() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    script.onload = async () => {
      try {
        await window.liff.init({ liffId: '1655880057-JYbxDG7B' })
        if (!window.liff.isLoggedIn()) {
          window.liff.login()
          return
        }
        const profile = await window.liff.getProfile()
        setUserId(profile.userId)
      } catch (e) {
        setError(String(e))
      }
    }
    document.head.appendChild(script)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
        <div className="text-3xl mb-4">🔑</div>
        <h1 className="font-bold text-lg mb-4">你的 LINE User ID</h1>
        {userId ? (
          <p className="font-mono text-sm bg-gray-100 rounded-xl px-4 py-3 break-all select-all">{userId}</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <p className="text-gray-400 text-sm">載入中...</p>
        )}
      </div>
    </div>
  )
}
