import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="text-gray-600 mt-2">
          最終更新日: 2024年3月15日
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
          <p className="mb-4">
            株式会社Timingood（以下、「当社」といいます。）は、LookMateサービス（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
          <p className="mb-4">
            当社は、以下の個人情報を収集する場合があります。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">氏名</li>
            <li className="mb-2">メールアドレス</li>
            <li className="mb-2">電話番号</li>
            <li className="mb-2">住所</li>
            <li className="mb-2">銀行口座情報</li>
            <li className="mb-2">適格請求書発行事業者登録番号</li>
            <li className="mb-2">SNSアカウント情報（インフルエンサーの場合）</li>
            <li className="mb-2">企業情報（広告主の場合）</li>
            <li className="mb-2">アクセスログ情報</li>
            <li className="mb-2">Cookie情報</li>
          </ul>
          <p className="mb-4">
            なお、インフルエンサーのフォロワーに関する情報（以下「フォロワーデータ」）については、以下の取り扱いを行います：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              フォロワーデータは、個人を特定できない形式でのみ取り扱われます。
            </li>
            <li className="mb-2">
              フォロワーデータは、カスタムオーディエンスの生成にのみ使用され、広告配信のターゲティング以外の目的では利用されません。
            </li>
            <li className="mb-2">
              フォロワーへの直接的な接触やメッセージ送信は一切行いません。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. 利用目的</h2>
          <p className="mb-4">
            収集した個人情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">本サービスの提供・運営のため</li>
            <li className="mb-2">ユーザーからのお問い合わせに対応するため</li>
            <li className="mb-2">利用料金の請求のため</li>
            <li className="mb-2">本サービスの改善・新機能開発のため</li>
            <li className="mb-2">マッチングの提案・調整のため</li>
            <li className="mb-2">不正利用の防止のため</li>
            <li className="mb-2">統計情報の作成のため</li>
          </ul>
          <p className="mb-4">
            フォロワーデータの利用目的は、以下の通りです：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">カスタムオーディエンスの生成</li>
            <li className="mb-2">広告配信のターゲティング</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. 個人情報の管理</h2>
          <p className="mb-4">
            当社は、個人情報の漏洩、滅失、き損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。具体的には以下の対策を実施しています：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">アクセス制御の実施</li>
            <li className="mb-2">データの暗号化</li>
            <li className="mb-2">セキュリティソフトウェアの導入</li>
            <li className="mb-2">従業員への教育・研修の実施</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. 個人情報の第三者提供</h2>
          <p className="mb-4">
            当社は、以下の場合を除き、個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">ユーザーの同意がある場合</li>
            <li className="mb-2">法令に基づく場合</li>
            <li className="mb-2">人の生命、身体または財産の保護のために必要がある場合</li>
            <li className="mb-2">公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
            <li className="mb-2">国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
          </ul>
          <p className="mb-4">
            フォロワーデータについては、以下の取り扱いを行います：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              フォロワーデータは、個人を特定できない形式で広告主に提供されます。
            </li>
            <li className="mb-2">
              広告主は、提供されたカスタムオーディエンスを本サービスの目的以外で使用することはできません。
            </li>
            <li className="mb-2">
              フォロワーデータの第三者提供は、カスタムオーディエンスの生成と提供に限定されます。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. 個人情報の委託</h2>
          <p className="mb-4">
            当社は、利用目的の達成に必要な範囲内において、以下の業務を外部委託先に委託する場合があります：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">データセンターの運営</li>
            <li className="mb-2">決済処理</li>
            <li className="mb-2">カスタマーサポート</li>
            <li className="mb-2">システムの保守・運用</li>
          </ul>
          <p className="mb-4">
            委託先に対しては、個人情報の取扱いに関する契約を締結し、適切な監督を行います。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. 個人情報の開示・訂正・利用停止</h2>
          <p className="mb-4">
            ユーザーは、当社が保有する個人情報について、開示、訂正、利用停止等を請求することができます。請求を行う場合は、本人確認の上、合理的な範囲で対応いたします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. 本ポリシーの変更</h2>
          <p className="mb-4">
            当社は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本サービス上での掲載をもって効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. お問い合わせ</h2>
          <p className="mb-4">
            本ポリシーに関するお問い合わせは、以下の連絡先までご連絡ください。
          </p>
          <p className="mb-4">
            株式会社Timingood<br />
            〒150-0002 東京都渋谷区渋谷2-24-12<br />
            メールアドレス: privacy@lookmate.jp
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;