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
        {/* LINE 浮動按鈕 */}
        <a
          href="https://line.me/R/ti/p/@LIANGCHICKEN"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.066 2 11.087c0 2.812 1.346 5.322 3.464 7.02.152.126.245.31.256.508l.052 1.59c.016.494.534.814.981.601l1.773-.784a.526.526 0 0 1 .351-.025c.99.272 2.042.419 3.123.419 5.523 0 10-4.066 10-9.087C22 6.066 17.523 2 12 2z"/>
          </svg>
          LINE 聯絡我們
        </a>
      </body>
    </html>
  )
}
