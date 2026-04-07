"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { calculate, generateMonthlyData, generateCostComparison, type SimInputs } from "@/lib/calc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";

function fmt(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}億`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}千万`;
  return `${v}万`;
}

export default function SimulationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [inputs, setInputs] = useState<SimInputs | null>(null);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/simulations?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.error) { setLoading(false); return; }
        setName(data.name);
        setCompanyName(data.company_name ?? "");
        setCreatedBy(data.created_by_name ?? "");
        setCreatedAt(data.created_at ? new Date(data.created_at).toLocaleDateString("ja-JP") : "");
        const operatorCount = Number(data.operator_count ?? 0);
        const personMonthCost = Number(data.person_month_cost);
        setInputs({
          operatorCount,
          operatorCost: operatorCount > 0 ? operatorCount * personMonthCost : Number(data.operator_cost),
          personMonthCost,
          monthlyCalls: data.monthly_calls, avgCallTime: Number(data.avg_call_time),
          systemCost: Number(data.system_cost), trainingCost: Number(data.training_cost),
          otherCost: Number(data.other_cost), initialInvestment: Number(data.initial_investment),
          monthlyAiCost: Number(data.monthly_ai_cost), monthlyApiCost: Number(data.monthly_api_cost ?? 0),
          automationRate: data.automation_rate,
          headcountReduction: data.headcount_reduction, trainingReductionRate: data.training_reduction_rate,
        });
        setLoading(false);
      });
  }, [id]);

  const results = useMemo(() => inputs ? calculate(inputs) : null, [inputs]);
  const monthlyData = useMemo(() => inputs && results ? generateMonthlyData(inputs, results) : [], [inputs, results]);
  const costComparison = useMemo(() => inputs && results ? generateCostComparison(inputs, results) : [], [inputs, results]);
  const paybackPoint = useMemo(() => {
    const idx = monthlyData.findIndex((d) => d.cumulativeSaving >= d.cumulativeInvestment);
    return idx >= 0 ? monthlyData[idx] : null;
  }, [monthlyData]);

  if (loading) return <AppShell><div className="flex h-full items-center justify-center"><p className="text-gray-400">読み込み中...</p></div></AppShell>;
  if (!inputs || !results) return <AppShell><div className="flex h-full items-center justify-center"><p className="text-red-500">データが見つかりません</p></div></AppShell>;

  return (
    <AppShell>
      {/* 印刷用CSS */}
      <style>{`
        @media print {
          /* 全体リセット */
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }

          /* 印刷エリアのみ表示 */
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }

          /* 非表示要素 */
          .no-print, aside, nav, [class*="chat-"], button[aria-label="AIアシスタント"] { display: none !important; }

          /* グラフのSVG確実表示 */
          #print-area svg { visibility: visible !important; }
          #print-area .recharts-wrapper { visibility: visible !important; overflow: visible !important; }
          #print-area .recharts-surface { visibility: visible !important; }
          #print-area .recharts-legend-wrapper { visibility: visible !important; }

          /* カード背景色を印刷 */
          #print-area [class*="bg-"] { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          /* ページ設定 */
          .print-break { page-break-before: always; }
          @page { margin: 12mm; size: A4 landscape; }

          /* テーブル */
          table { border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; }
        }
      `}</style>

      <div className="px-4 py-6 sm:px-8">
        {/* ヘッダー（印刷時非表示のボタン） */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 no-print">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">
              {companyName && <span>{companyName} | </span>}
              {createdBy && <span>作成者: {createdBy} | </span>}
              {createdAt}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              印刷 / PDF保存
            </button>
            <button onClick={() => router.push("/history")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">一覧に戻る</button>
          </div>
        </div>

        {/* 印刷エリア */}
        <div id="print-area">
          {/* 印刷用ヘッダー（画面では非表示） */}
          <div className="mb-6 hidden print:block">
            <h1 className="text-2xl font-bold text-gray-900">AI導入 収益計画シミュレーション</h1>
            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span>シミュレーション名: {name}</span>
              {companyName && <span>企業名: {companyName}</span>}
              {createdBy && <span>作成者: {createdBy}</span>}
              <span>作成日: {createdAt}</span>
            </div>
            <hr className="mt-3 border-gray-300" />
          </div>

          {/* KPIカード */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">月間コスト削減額</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">¥{fmt(results.monthlySaving)}</p>
              <p className="text-[10px] text-gray-400">現状比 -{results.reductionRate}%</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">年間効果額</p>
              <p className="mt-1 text-2xl font-bold text-green-600">¥{fmt(results.annualSaving)}</p>
              <p className="text-[10px] text-gray-400">12ヶ月換算</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">ROI</p>
              <p className="mt-1 text-2xl font-bold text-violet-600">{results.roi}%</p>
              <p className="text-[10px] text-gray-400">投資対効果</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400">投資回収期間</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{results.paybackMonths >= 999 ? "—" : `${results.paybackMonths}ヶ月`}</p>
              <p className="text-[10px] text-gray-400">初期投資 ¥{fmt(inputs.initialInvestment)}</p>
            </div>
          </div>

          {/* グラフ */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">投資回収シミュレーション</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                  <Tooltip formatter={(value) => [`¥${Number(value).toLocaleString()}万`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="cumulativeSaving" name="累積削減額" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="cumulativeInvestment" name="累積投資額" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  {paybackPoint && <ReferenceDot x={paybackPoint.label} y={paybackPoint.cumulativeSaving} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2} />}
                </LineChart>
              </ResponsiveContainer>
              {paybackPoint && (
                <p className="mt-2 text-center text-xs font-medium text-violet-600">回収完了: {results.paybackMonths}ヶ月目</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">月次コスト比較（導入前 vs 導入後）</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={costComparison} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                  <Tooltip formatter={(value) => [`¥${Number(value).toLocaleString()}万`, ""]} />
                  <Legend />
                  <Bar dataKey="before" name="導入前" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="導入後" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* コスト内訳テーブル（印刷に最適） */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h4 className="mb-4 text-sm font-semibold text-gray-700">コスト内訳</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-600">項目</th>
                  <th className="py-2 text-right font-medium text-gray-600">現状</th>
                  <th className="py-2 text-right font-medium text-gray-600">導入後</th>
                  <th className="py-2 text-right font-medium text-gray-600">削減額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costComparison.map((row) => (
                  <tr key={row.name}>
                    <td className="py-2 text-gray-700">{row.name}</td>
                    <td className="py-2 text-right text-gray-500">¥{row.before.toLocaleString()}万</td>
                    <td className="py-2 text-right text-violet-600">¥{row.after.toLocaleString()}万</td>
                    <td className="py-2 text-right font-medium text-green-600">-¥{(row.before - row.after).toLocaleString()}万</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2 text-gray-900">合計</td>
                  <td className="py-2 text-right text-gray-900">¥{fmt(results.currentMonthlyCost)}</td>
                  <td className="py-2 text-right text-violet-600">¥{fmt(results.afterMonthlyCost)}</td>
                  <td className="py-2 text-right text-green-600">-¥{fmt(results.monthlySaving)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 前提条件（印刷用） */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
            <h4 className="mb-4 text-sm font-semibold text-gray-700">前提条件</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
              <div className="flex justify-between"><span className="text-gray-500">オペレーター人数</span><span className="font-medium">{inputs.operatorCount}人</span></div>
              <div className="flex justify-between"><span className="text-gray-500">人月コスト</span><span className="font-medium">¥{inputs.personMonthCost.toLocaleString()}万/人月</span></div>
              <div className="flex justify-between"><span className="text-gray-500">オペレーター人件費</span><span className="font-medium">¥{(inputs.operatorCount * inputs.personMonthCost).toLocaleString()}万/月</span></div>
              <div className="flex justify-between"><span className="text-gray-500">月間対応件数</span><span className="font-medium">{inputs.monthlyCalls.toLocaleString()}件</span></div>
              <div className="flex justify-between"><span className="text-gray-500">1件平均対応時間</span><span className="font-medium">{inputs.avgCallTime}分</span></div>
              <div className="flex justify-between"><span className="text-gray-500">システム運用費</span><span className="font-medium">¥{inputs.systemCost.toLocaleString()}万/月</span></div>
              <div className="flex justify-between"><span className="text-gray-500">教育費用</span><span className="font-medium">¥{inputs.trainingCost.toLocaleString()}万/年</span></div>
              <div className="flex justify-between"><span className="text-gray-500">初期投資</span><span className="font-medium">¥{inputs.initialInvestment.toLocaleString()}万</span></div>
              <div className="flex justify-between"><span className="text-gray-500">AI月額費用</span><span className="font-medium">¥{inputs.monthlyAiCost.toLocaleString()}万/月</span></div>
              <div className="flex justify-between"><span className="text-gray-500">API従量課金費用</span><span className="font-medium">¥{inputs.monthlyApiCost.toLocaleString()}万/月</span></div>
              <div className="flex justify-between"><span className="text-gray-500">AI自動化率</span><span className="font-medium">{inputs.automationRate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">人員削減見込み</span><span className="font-medium">{inputs.headcountReduction}人</span></div>
              <div className="flex justify-between"><span className="text-gray-500">教育削減率</span><span className="font-medium">{inputs.trainingReductionRate}%</span></div>
            </div>
          </div>

          {/* 印刷フッター */}
          <div className="mt-6 hidden text-center text-xs text-gray-400 print:block">
            AI Strategy Agent — 収益計画シミュレーション | {createdAt} | Confidential
          </div>
        </div>
      </div>
    </AppShell>
  );
}
