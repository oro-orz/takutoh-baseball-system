import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">利用規約</h1>
        <p className="text-gray-600 mt-2">
          最終更新日: 2024年3月15日
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
          <p className="mb-4">
            この利用規約（以下、「本規約」といいます。）は、株式会社Timingood（以下、「当社」といいます。）が提供するLookMateサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. 定義</h2>
          <p className="mb-4">
            本規約において使用する用語の定義は、以下の通りとします。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              「インフルエンサー」とは、本サービスを通じてフォロワーデータのライセンス提供を行う個人または法人を指します。
            </li>
            <li className="mb-2">
              「広告主」とは、本サービスを通じてインフルエンサーのフォロワーデータから生成されたカスタムオーディエンスを利用する企業を指します。
            </li>
            <li className="mb-2">
              「フォロワーデータ」とは、インフルエンサーのSNSフォロワーに関する統計データを指し、個人を特定できない形式で提供されるものをいいます。
            </li>
            <li className="mb-2">
              「カスタムオーディエンス」とは、フォロワーデータを基に生成され、広告配信のターゲティングに使用されるオーディエンスデータを指します。
            </li>
            <li className="mb-2">
              「ライセンス」とは、カスタムオーディエンスの利用権を指します。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. 本規約への同意</h2>
          <p className="mb-4">
            ユーザーは、本規約に同意の上、本サービスを利用するものとします。本規約に同意できない場合には、本サービスを利用することはできません。
          </p>
          <p className="mb-4">
            当社は、本規約を予告なく変更することがあります。変更後の規約は、本サービス上での掲載をもって効力を生じるものとします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. サービスの内容</h2>
          <p className="mb-4">
            本サービスは、インフルエンサーのフォロワーデータを広告主にライセンス提供するプラットフォームを提供します。具体的には以下のサービスを含みます：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">フォロワーデータのライセンス提供</li>
            <li className="mb-2">ライセンス料の決済管理</li>
            <li className="mb-2">請求書発行支援</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. フォロワーデータの取り扱い</h2>
          <p className="mb-4">
            フォロワーデータの取り扱いについては、以下の通りとします：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              フォロワーデータは、個人を特定できない形式で提供され、フォロワー個人のプライバシーは完全に保護されます。
            </li>
            <li className="mb-2">
              本サービスは、フォロワーに直接的な影響を与えることはなく、フォロワーへのメッセージ送信や直接的な接触は一切行いません。
            </li>
            <li className="mb-2">
              フォロワーデータは、カスタムオーディエンスの生成にのみ使用され、広告主は生成されたカスタムオーディエンスのみを利用することができます。
            </li>
            <li className="mb-2">
              広告主は、提供されたカスタムオーディエンスを本サービスの目的以外で使用することはできません。
            </li>
            <li className="mb-2">
              インフルエンサーは、フォロワーデータの提供について、適切な権限を有していることを保証するものとします。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. ライセンス料の支払い</h2>
          <p className="mb-4">
            ライセンス料の支払いについては、以下の通りとします：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              ライセンス料は、当社が定める方法により支払うものとします。
            </li>
            <li className="mb-2">
              請求書は、インフルエンサーが発行し、当社が受領するものとします。
            </li>
            <li className="mb-2">
              支払期限は、請求書発行日から30日以内とします。
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. 禁止事項</h2>
          <p className="mb-4">
            ユーザーは、以下の行為を行ってはならないものとします：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              本サービスの運営を妨害する行為
            </li>
            <li className="mb-2">
              他のユーザーに迷惑をかける行為
            </li>
            <li className="mb-2">
              法令または公序良俗に違反する行為
            </li>
            <li className="mb-2">
              フォロワーデータの不正な取得または使用
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. 免責事項</h2>
          <p className="mb-4">
            当社は、以下の事項について一切の責任を負いません：
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              本サービスの利用により生じた損害
            </li>
            <li className="mb-2">
              フォロワーデータの正確性、完全性、有用性
            </li>
            <li className="mb-2">
              本サービスの中断、停止、終了
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. 知的財産権</h2>
          <p className="mb-4">
            本サービスに関する知的財産権は、当社または正当な権利を有する第三者に帰属します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. 準拠法・管轄裁判所</h2>
          <p className="mb-4">
            本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;