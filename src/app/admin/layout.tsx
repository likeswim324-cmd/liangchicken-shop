import Link from 'next/link'
import LogoutButton from './LogoutButton'

const navItems = [
  { href: '/admin/orders', label: '訂單' },
  { href: '/admin/products', label: '商品' },
  { href: '/admin/settings', label: '設定' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-1">
          <span className="text-amber-400 font-bold text-sm mr-4">⚙ 後台管理</span>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition">
              {item.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition">
              ← 回前台
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
