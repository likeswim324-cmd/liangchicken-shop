export default function DataDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-bold text-2xl text-gray-800 mb-2">用戶資料刪除說明</h1>
      <p className="text-sm text-gray-400 mb-8">最後更新：2026年4月21日</p>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-800 mb-2">如何刪除您的資料</h2>
          <p>若您希望刪除梁雞商行所保存的個人資料，請透過以下方式提出申請：</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>寄信至 <a href="mailto:likeswim324@gmail.com" className="text-amber-600 underline">likeswim324@gmail.com</a>，主旨填寫「資料刪除申請」</li>
            <li>來信請告知您的帳號信箱或 Facebook 名稱</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">處理時間</h2>
          <p>我們將在收到申請後 7 個工作天內完成刪除，並以信件回覆確認。</p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 mb-2">刪除範圍</h2>
          <p>刪除後，您的姓名、信箱、會員點數及歷史訂單資料將一併移除，且無法復原。</p>
        </section>
      </div>
    </div>
  )
}
