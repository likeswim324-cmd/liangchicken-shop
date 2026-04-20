'use client'
import { useEffect, useState } from 'react'

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? ''

type LiffProfile = {
  displayName: string
  pictureUrl?: string
  userId: string
}

export function useLiff() {
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!LIFF_ID) { setReady(true); return }

    // 動態載入 LIFF SDK（避免 SSR 報錯）
    const script = document.createElement('script')
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
    script.onload = async () => {
      try {
        await window.liff.init({ liffId: LIFF_ID })
        if (window.liff.isLoggedIn()) {
          const p = await window.liff.getProfile()
          setProfile(p)
        }
      } catch (e) {
        console.warn('LIFF init failed', e)
      } finally {
        setReady(true)
      }
    }
    script.onerror = () => setReady(true)
    document.head.appendChild(script)
  }, [])

  return { profile, ready }
}

// 讓 TypeScript 認識 window.liff
declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>
      isLoggedIn: () => boolean
      getProfile: () => Promise<LiffProfile>
    }
  }
}
