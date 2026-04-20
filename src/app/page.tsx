import Link from 'next/link'
import { products } from '@/lib/products'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const featured = products.slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-amber-700 text-white py-16 px-4 text-center">
        <p className="text-amber-200 text-sm mb-2 tracking-widest">桃園在地 · 第三代賣雞</p>
        <h1 className="text-3xl font-bold mb-3">安心好吃，當天送到家</h1>
        <p className="text-amber-100 text-base max-w-sm mx-auto mb-6">
          當日現宰、零腥殘、分切好直接下鍋。土雞、玉米雞，誠實標示不忽悠。
        </p>
        <Link
          href="/products"
          className="inline-block bg-white text-amber-700 font-bold px-6 py-3 rounded-2xl hover:bg-amber-50 transition"
        >
          立即選購 →
        </Link>
      </section>

      {/* 三大賣點 */}
      <section className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: '🔪', title: '當日現宰', desc: '不存貨，早上殺下午到' },
          { icon: '📦', title: '分切好下鍋', desc: '回家直接煮，省時不費力' },
          { icon: '✅', title: '誠實標示', desc: '土雞就是土雞，不用肉雞混充' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
            <div className="text-gray-500 text-xs">{item.desc}</div>
          </div>
        ))}
      </section>

      {/* 精選商品 */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">精選商品</h2>
          <Link href="/products" className="text-sm text-amber-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 品牌故事 */}
      <section className="bg-amber-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-700 text-sm font-medium mb-2">關於梁雞商行</p>
          <h2 className="text-xl font-bold text-gray-800 mb-4">從市場走出來的誠實雞肉路</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            第三代賣雞，從一天 3000 元做到 3-4 萬。我們不用肉雞冒充土雞，
            教你怎麼煮不會柴，堅持當日現宰當日配送。
            你吃到的每一口，都是我們對品質的承諾。
          </p>
          <Link href="/products" className="inline-block mt-6 bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-800 transition">
            選購商品
          </Link>
        </div>
      </section>
    </div>
  )
}
