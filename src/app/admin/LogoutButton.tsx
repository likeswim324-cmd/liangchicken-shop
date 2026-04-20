'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }
  return (
    <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition">
      登出
    </button>
  )
}
