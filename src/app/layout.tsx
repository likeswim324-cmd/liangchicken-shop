import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: '梁雞商行 — 當日現宰，安心送到家',
  description: '桃園在地土雞、玉米雞，當日現宰當日配送。安心、好吃、不踩雷。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 bg-white">
          © 2025 梁雞商行 · 桃園在地生鮮直送
        </footer>
      </body>
    </html>
  )
}
