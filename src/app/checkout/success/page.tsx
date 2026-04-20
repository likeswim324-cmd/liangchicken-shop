import Link from 'next/link'

export default function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">訂單成立！</h1>
      {searchParams.order && (
        <p className="text-gray-400 text-sm mb-2">訂單編號：{searchParams.order}</p>
      )}
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        我們收到你的訂單了，<br />
        小瑋會盡快安排出貨，當天送到你家！
      </p>
      <Link href="/products" className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-amber-700 transition">
        繼續選購
      </Link>
    </div>
  )
}
