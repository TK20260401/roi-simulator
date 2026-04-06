"use client";

import AppShell from "@/components/app-shell";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    title: "はじめに",
    items: [
      {
        q: "このアプリは何ができますか？",
        a: "AIコールセンターシステムを導入した場合の費用対効果（ROI）を、数値を入力するだけで即座にシミュレーションできます。投資回収期間・年間効果額・コスト削減率がリアルタイムでグラフ表示されるため、クライアントへの提案時にそのまま画面を見せられます。",
      },
      {
        q: "誰が使うことを想定していますか？",
        a: "営業担当者がクライアントとの商談中にその場でシミュレーションを行い、投資対効果を数値で示すことを想定しています。ITの専門知識は不要です。",
      },
    ],
  },
  {
    title: "シミュレーションの使い方",
    items: [
      {
        q: "どうやってシミュレーションを作成しますか？",
        a: "サイドバーの「シミュレーション」をクリックすると、入力画面が表示されます。左側のコスト項目に数値を入力すると、右側のグラフと結果カードがリアルタイムで更新されます。",
      },
      {
        q: "入力する数値がわかりません",
        a: "各入力項目の横にある「?」アイコンにカーソルを合わせると、その項目の説明が表示されます。わからない場合はデフォルト値のまま始めて、商談中にクライアントと一緒に調整するのがおすすめです。",
      },
      {
        q: "スライダーは何を調整するものですか？",
        a: "「AI自動化率」はコール対応のうちAIが処理する割合、「教育コスト削減率」はAI導入で教育費がどれだけ下がるかの見込みです。スライダーを動かすとグラフが即座に変わります。",
      },
      {
        q: "シミュレーション結果を保存できますか？",
        a: "はい。入力パネル下部の「保存」セクションで名前をつけて保存できます。保存したシミュレーションは「履歴」ページから確認・再表示できます。",
      },
    ],
  },
  {
    title: "結果の見方",
    items: [
      {
        q: "ROIとは何ですか？",
        a: "ROI（Return on Investment）は投資対効果のことです。例えばROI 300%なら、投資した金額の3倍のリターンが得られることを意味します。一般的に100%以上なら投資回収できている状態です。",
      },
      {
        q: "投資回収期間とは何ですか？",
        a: "AI導入の初期費用を、毎月のコスト削減額で何ヶ月で回収できるかを示します。例えば「4.8ヶ月」なら、約5ヶ月で初期投資を回収し、それ以降は純粋なコスト削減効果が得られます。",
      },
      {
        q: "折れ線グラフの交差点は何を意味しますか？",
        a: "紫の線（累積コスト削減額）が赤の線（累積投資額）を超えるポイントが「投資回収完了」です。それ以降は投資を上回る効果が出ています。",
      },
      {
        q: "棒グラフは何を比較していますか？",
        a: "灰色が「導入前の月間コスト」、紫が「導入後の月間コスト」です。各カテゴリ（人件費・システム・教育費・その他）ごとにどれだけ削減できるかを一目で確認できます。",
      },
    ],
  },
  {
    title: "KGI/KPI管理",
    items: [
      {
        q: "KGIとKPIの違いは何ですか？",
        a: "KGI（Key Goal Indicator）は最終目標（例: 年間コスト30%削減）、KPI（Key Performance Indicator）はKGI達成に向けた中間指標（例: 月間AI対応率60%）です。KGIの下にKPIを紐付けて管理します。",
      },
      {
        q: "他の人が登録したKGI/KPIは見えますか？",
        a: "はい、チーム全体で共有されます。誰が登録したかは「登録者」として表示されます。メールアドレス等の個人情報は表示されません。",
      },
    ],
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenIndex(openIndex === key ? null : key);
  }

  return (
    <AppShell>
      <div className="px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900">ヘルプ</h2>
        <p className="mb-8 mt-1 text-sm text-gray-500">アプリの使い方・よくある質問</p>

        {/* クイックスタート */}
        <div className="mb-8 rounded-xl border border-violet-100 bg-violet-50 p-5">
          <h3 className="mb-3 text-sm font-bold text-violet-700">クイックスタート（3ステップ）</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">1</span>
              <div>
                <p className="text-sm font-medium text-gray-800">シミュレーション画面を開く</p>
                <p className="text-xs text-gray-500">サイドバーの「シミュレーション」をクリック</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">2</span>
              <div>
                <p className="text-sm font-medium text-gray-800">現状コストを入力</p>
                <p className="text-xs text-gray-500">左パネルに数値を入力すると、右側のグラフが即座に更新されます</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">3</span>
              <div>
                <p className="text-sm font-medium text-gray-800">結果を確認・保存</p>
                <p className="text-xs text-gray-500">ROI・回収期間を確認し、名前をつけて保存。商談で画面を見せましょう</p>
              </div>
            </div>
          </div>
          <Link href="/simulations/new" className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
            シミュレーションを始める →
          </Link>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-base font-semibold text-gray-800">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={key} className="rounded-xl border border-gray-100 bg-white">
                      <button
                        onClick={() => toggle(key)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {item.q}
                        <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-500">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
