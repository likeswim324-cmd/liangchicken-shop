export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-bold text-2xl text-gray-800 mb-2">隱私權政策</h1>
      <p className="text-sm text-gray-400 mb-8">最後更新：2026年4月21日</p>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-800 mb-2">1. 蒐集的資料</h2>
          <p>當您透過 Google 或 Facebook 登入時，我們會取得您的姓名與電子信箱，用於建立會員帳號及提供訂購服務。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">2. 資料用途</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>建立及管理您的會員帳號</li>
            <li>處理訂單與配送</li>
            <li>發送會員優惠與訂單通知</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">3. 資料分享</h2>
          <p>我們不會將您的個人資料出售或出租給第三方。僅在處理訂單所需範圍內與物流業者分享必要資訊。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">4. 資料保存</h2>
          <p>您的資料將保存至您主動要求刪除為止。您可以隨時向我們提出刪除請求。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">5. 聯絡我們</h2>
          <p>如有任何隱私相關問題，請來信：<a href="mailto:likeswim324@gmail.com" className="text-amber-600 underline">likeswim324@gmail.com</a></p>
        </section>
      </div>
    </div>
  )
}
