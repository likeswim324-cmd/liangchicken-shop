import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import productsData from '@/data/products.json'
import type { Product } from '@/lib/products'

export default function HomePage() {
  const featured = (productsData as Product[]).filter(p => p.featured).slice(0, 6)

  return (
    <div className="bg-white">

      {/* Hero — full-width image */}
      <section className="relative w-full" style={{ minHeight: '88vh' }}>
        <img
          src="/hero.jpg"
          alt="梁雞商行 新鮮雞肉"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlay — left side darker for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        <div className="relative z-10 h-full flex items-center" style={{ minHeight: '88vh' }}>
          <div className="max-w-5xl mx-auto px-6 md:px-12 w-full">
            <p className="text-amber-300 text-sm tracking-[0.3em] mb-4 uppercase">
              桃園在地 · 第三代賣雞
            </p>
            <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              安心好吃<br />當天送到家
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-md mb-10 leading-relaxed">
              當日現宰、零腥殘、分切好直接下鍋。<br />
              土雞、玉米雞，誠實標示不忽悠。
            </p>
            <Link
              href="/products"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-4 rounded-full text-base transition-colors"
            >
              立即選購 →
            </Link>
          </div>
        </div>
      </section>

      {/* 三大賣點 — clean strip */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🔪', title: '當日現宰', desc: '不存貨，早上殺下午到' },
            { icon: '📦', title: '分切好下鍋', desc: '回家直接煮，省時不費力' },
            { icon: '✅', title: '誠實標示', desc: '土雞就是土雞，不用肉雞混充' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <div className="text-4xl">{item.icon}</div>
              <div className="font-semibold text-gray-900 text-base">{item.title}</div>
              <div className="text-gray-500 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 精選商品 */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-amber-600 text-xs tracking-widest uppercase mb-1">精選推薦</p>
            <h2 className="text-gray-900 text-2xl font-bold">本週主打商品</h2>
          </div>
          <Link href="/products" className="text-sm text-gray-500 hover:text-amber-600 transition underline underline-offset-4">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 品牌故事 — dark editorial block */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-4">關於梁雞商行</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            從市場走出來的<br />誠實雞肉路
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-xl mx-auto">
            第三代賣雞，從一天 3,000 元做到 3–4 萬。我們不用肉雞冒充土雞，
            教你怎麼煮不會柴，堅持當日現宰當日配送。
            你吃到的每一口，都是我們對品質的承諾。
          </p>
          <Link
            href="/products"
            className="inline-block border border-white/40 hover:bg-white hover:text-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors"
          >
            選購商品
          </Link>
        </div>
      </section>

    </div>
  )
}
