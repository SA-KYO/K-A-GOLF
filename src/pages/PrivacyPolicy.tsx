import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-yellow-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={goBack}
          className="mb-8 flex items-center gap-2 bg-yellow-400 px-6 py-3 border-4 border-black font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform"
          style={{ boxShadow: '4px 4px 0 0 var(--shadow-color)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>

        <div className="bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
          <h1 className="text-3xl md:text-4xl font-black text-center mb-8 uppercase" style={{ color: '#22C55E' }}>
            プライバシーポリシー
          </h1>

          <div className="space-y-8 text-black">
            <section>
              <p className="text-sm text-gray-600 mb-6">
                最終更新日：2026年1月30日
              </p>
              <p className="leading-relaxed">
                希楽夢杯実行委員会（以下「当委員会」といいます）は、第一回 希楽夢杯（以下「本イベント」といいます）の懇親会参加申込にあたり、
                ご提供いただく個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                1. 個人情報の定義
              </h2>
              <p className="leading-relaxed">
                本ポリシーにおける「個人情報」とは、個人情報保護法第2条第1項に定義される、
                生存する個人に関する情報であって、当該情報に含まれる氏名、連絡先その他の記述等により特定の個人を識別できるものをいいます。
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                2. 収集する個人情報の種類
              </h2>
              <p className="mb-3 font-bold">本イベントの懇親会参加申込において、以下の個人情報を収集いたします：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">氏名（本名フルネーム）</li>
                <li className="leading-relaxed">出欠確認情報（参加/不参加の意思表示）</li>
                <li className="leading-relaxed">コメント・メッセージ（任意）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                3. 個人情報の利用目的
              </h2>
              <p className="mb-3 font-bold">収集した個人情報は、以下の目的で利用いたします：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">本イベントの参加者の確認および管理</li>
                <li className="leading-relaxed">ゴルフ場の予約手続きおよび当日の受付</li>
                <li className="leading-relaxed">本イベントに関する連絡・お知らせの送付</li>
                <li className="leading-relaxed">本イベントの運営に必要な事項の確認</li>
                <li className="leading-relaxed">緊急時の連絡対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                4. 個人情報の第三者提供
              </h2>
              <p className="leading-relaxed mb-3">
                当委員会は、以下の場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">
                  <span className="font-bold">本イベント開催に必要な範囲での提供：</span>
                  ゴルフ場への予約および当日の受付のため、参加者の氏名を提供いたします
                </li>
                <li className="leading-relaxed">法令に基づく場合</li>
                <li className="leading-relaxed">人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                5. 個人情報の管理・保護
              </h2>
              <p className="mb-3 font-bold">当委員会は、個人情報の紛失、破壊、改ざん及び漏洩等を防止するため、以下の措置を講じます：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">個人情報へのアクセス制限の実施</li>
                <li className="leading-relaxed">セキュアなデータベースシステム（Supabase）による情報管理</li>
                <li className="leading-relaxed">通信の暗号化（SSL/TLS）の実施</li>
                <li className="leading-relaxed">定期的なセキュリティ対策の見直し</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                6. 個人情報の保管期間
              </h2>
              <p className="leading-relaxed">
                収集した個人情報は、本イベントの運営に必要な期間、および法令で定められた期間保管し、
                その後適切な方法で削除または廃棄いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                7. 個人情報の開示・訂正・削除
              </h2>
              <p className="leading-relaxed mb-3">
                ご本人から個人情報の開示、訂正、削除等のご請求があった場合は、合理的な期間内に対応いたします。
                ご希望の場合は、下記のお問い合わせ先までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                8. Cookie等の使用
              </h2>
              <p className="leading-relaxed">
                本イベントの申込システムでは、利用状況の把握や機能改善のため、
                Cookie等の技術を使用する場合がありますが、個人を特定する情報の収集は行いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                9. プライバシーポリシーの変更
              </h2>
              <p className="leading-relaxed">
                当委員会は、法令の変更や事業内容の変更等に応じて、本ポリシーを変更することがあります。
                変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <section className="bg-gray-50 border-4 border-black p-6">
              <h2 className="text-xl md:text-2xl font-black mb-4 pb-2 border-b-4 border-black">
                10. お問い合わせ
              </h2>
              <p className="leading-relaxed mb-4">
                個人情報の取り扱いに関するご質問、開示・訂正・削除等のご請求は、以下までご連絡ください：
              </p>
              <div className="font-bold space-y-1">
                <p>希楽夢杯実行委員会</p>
              </div>
            </section>

            <section className="text-center pt-6 border-t-4 border-black">
              <p className="text-sm text-gray-600">
                制定日：2025年12月23日<br />
                希楽夢杯実行委員会
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
