'use client'
import { useEffect, useState } from 'react'

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? ''
const SESSION_KEY = 'lc_liff_profile'

type LiffProfile = {
  displayName: string
  pictureUrl?: string
  userId: string
}

// Module-level cache for current JS context
let _initPromise: Promise<LiffProfile | null> | null = null

function getLiffProfile(): Promise<LiffProfile | null> {
  if (_initPromise) return _initPromise

  _initPromise = new Promise<LiffProfile | null>((resolve) => {
    if (!LIFF_ID) { resolve(null); return }

    // If we already have the profile in sessionStorage, skip liff.init() entirely
    // This prevents repeated LIFF auth redirects on full page reloads in LINE's WebView
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      if (cached) {
        resolve(JSON.parse(cached))
        return
      }
    } catch {}

    const doInit = async () => {
      try {
        await window.liff.init({ liffId: LIFF_ID })
        if (window.liff.isLoggedIn()) {
          const p = await window.liff.getProfile()
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(p)) } catch {}
          resolve(p)
        } else {
          resolve(null)
        }
      } catch (e) {
        console.warn('LIFF init failed', e)
        resolve(null)
      }
    }

    if (window.liff) {
      doInit()
    } else {
      const script = document.createElement('script')
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
      script.onload = () => doInit()
      script.onerror = () => resolve(null)
      document.head.appendChild(script)
    }
  })

  return _initPromise
}

export function useLiff() {
  // Pre-populate from sessionStorage to avoid flicker on page reload
  const [profile, setProfile] = useState<LiffProfile | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      return cached ? JSON.parse(cached) : null
    } catch { return null }
  })
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return !!sessionStorage.getItem(SESSION_KEY) } catch { return false }
  })

  useEffect(() => {
    if (ready) return // Already have profile from sessionStorage
    getLiffProfile().then((p) => {
      setProfile(p)
      setReady(true)
    })
  }, [])

  return { profile, ready }
}

// 讓 TypeScript 認識 window.liff
declare global {
  interface Window {
    liff: {
      init: (config: { liffId: string }) => Promise<void>
      isLoggedIn: () => boolean
      login: () => void
      getProfile: () => Promise<LiffProfile>
    }
  }
}
