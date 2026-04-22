'use client'
import { useEffect, useState } from 'react'

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? ''

type LiffProfile = {
  displayName: string
  pictureUrl?: string
  userId: string
}

// Module-level cache — LIFF must only be initialized once per session
let _initPromise: Promise<LiffProfile | null> | null = null

function getLiffProfile(): Promise<LiffProfile | null> {
  if (_initPromise) return _initPromise

  _initPromise = new Promise<LiffProfile | null>((resolve) => {
    if (!LIFF_ID) { resolve(null); return }

    const doInit = async () => {
      try {
        await window.liff.init({ liffId: LIFF_ID })
        if (window.liff.isLoggedIn()) {
          const p = await window.liff.getProfile()
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
  const [profile, setProfile] = useState<LiffProfile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
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
