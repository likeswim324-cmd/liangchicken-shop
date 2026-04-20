'use client'
import Link from 'next/link'
import { ShoppingCart, LogIn, LogOut, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase-browser'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems())
  const { user, displayName } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-amber-700 tracking-wide">
          梁雞商行
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-gray-600 hover:text-amber-700">
            商品
          </Link>

          {mounted && (
            user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-1 text-sm text-gray-600 hover:text-amber-700">
                <LogIn className="w-4 h-4" />
                登入
              </Link>
            )
          )}

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
