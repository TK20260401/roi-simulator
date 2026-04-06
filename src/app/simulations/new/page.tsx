"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { calculate, generateMonthlyData, generateCostComparison, type SimInputs } from "@/lib/calc";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, ReferenceDot,
} from "recharts";
import HelpTip from "@/components/tooltip";

type Preset = {
  name: string;
  description: string;
  inputs: SimInputs;
};

const PRESETS: Preset[] = [
  {
    name: "カスタム",
    description: "自由に値を入力",
    inputs: {
      operatorCost: 0, personMonthCost: 0, monthlyCalls: 0, avgCallTime: 0,
      systemCost: 0, trainingCost: 0, otherCost: 0,
      initialInvestment: 0, monthlyAiCost: 0,
      automationRate: 0, headcountReduction: 0, trainingReductionRate: 0,
    },
  },
  {
    name: "コールセンター（中規模）",
    description: "50〜100席規模、月間1万〜2万コール",
    inputs: {
      operatorCost: 2000, personMonthCost: 80, monthlyCalls: 15000, avgCallTime: 8,
      systemCost: 300, trainingCost: 500, otherCost: 100,
      initialInvestment: 6000, monthlyAiCost: 200,
      automationRate: 60, headcountReduction: 12, trainingReductionRate: 60,
    },
  },
  {
    name: "コールセンター（大規模）",
    description: "200席以上、月間5万コール超",
    inputs: {
      operatorCost: 8000, personMonthCost: 75, monthlyCalls: 50000, avgCallTime: 7,
      systemCost: 800, trainingCost: 2000, otherCost: 500,
      initialInvestment: 15000, monthlyAiCost: 500,
      automationRate: 50, headcountReduction: 40, trainingReductionRate: 50,
    },
  },
  {
    name: "製造業（問い合わせ窓口）",
    description: "製品サポート・技術問い合わせ対応",
    inputs: {
      operatorCost: 800, personMonthCost: 85, monthlyCalls: 5000, avgCallTime: 12,
      systemCost: 150, trainingCost: 300, otherCost: 50,
      initialInvestment: 3000, monthlyAiCost: 100,
      automationRate: 40, headcountReduction: 4, trainingReductionRate: 40,
    },
  },
  {
    name: "小売・EC（カスタマーサポート）",
    description: "注文・返品・配送に関する問い合わせ",
    inputs: {
      operatorCost: 1200, personMonthCost: 70, monthlyCalls: 20000, avgCallTime: 5,
      systemCost: 200, trainingCost: 400, otherCost: 80,
      initialInvestment: 4000, monthlyAiCost: 150,
      automationRate: 70, headcountReduction: 10, trainingReductionRate: 65,
    },
  },
  {
    name: "金融・保険（コンタクトセンター）",
    description: "契約・請求・商品案内の対応",
    inputs: {
      operatorCost: 3000, personMonthCost: 90, monthlyCalls: 12000, avgCallTime: 10,
      systemCost: 500, trainingCost: 800, otherCost: 200,
      initialInvestment: 8000, monthlyAiCost: 300,
      automationRate: 45, headcountReduction: 15, trainingReductionRate: 50,
    },
  },
  {
    name: "自治体・官公庁（窓口業務）",
    description: "住民からの問い合わせ・手続き案内",
    inputs: {
      operatorCost: 600, personMonthCost: 60, monthlyCalls: 8000, avgCallTime: 10,
      systemCost: 100, trainingCost: 200, otherCost: 30,
      initialInvestment: 2000, monthlyAiCost: 80,
      automationRate: 55, headcountReduction: 5, trainingReductionRate: 45,
    },
  },
];

const defaultInputs = PRESETS[1].inputs;

function fmt(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}億`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}千万`;
  return `${v}万`;
}

export default function SimulationPage() {
  const router = useRouter();
  const [inputs, setInputs] = useState<SimInputs>(defaultInputs);
  const [simName, setSimName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof SimInputs, value: number) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  const results = useMemo(() => calculate(inputs), [inputs]);
  const monthlyData = useMemo(() => generateMonthlyData(inputs, results), [inputs, results]);
  const costComparison = useMemo(() => generateCostComparison(inputs, results), [inputs, results]);

  // 回収ポイント
  const paybackPoint = useMemo(() => {
    const idx = monthlyData.findIndex((d) => d.cumulativeSaving >= d.cumulativeInvestment);
    return idx >= 0 ? monthlyData[idx] : null;
  }, [monthlyData]);

  async function handleSave() {
    if (!simName.trim()) { setError("シミュレーション名を入力してください。"); return; }
    setError(""); setSaving(true); setSaved(false);

    // Cookie から表示名を取得
    const displayName = document.cookie.split("; ").find(c => c.startsWith("display_name="))?.split("=")[1] || "unknown";

    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: simName,
        company_name: companyName || null,
        created_by_name: decodeURIComponent(displayName),
        operator_cost: inputs.operatorCost,
        person_month_cost: inputs.personMonthCost,
        monthly_calls: inputs.monthlyCalls,
        avg_call_time: inputs.avgCallTime,
        system_cost: inputs.systemCost,
        training_cost: inputs.trainingCost,
        other_cost: inputs.otherCost,
        initial_investment: inputs.initialInvestment,
        monthly_ai_cost: inputs.monthlyAiCost,
        automation_rate: inputs.automationRate,
        headcount_reduction: inputs.headcountReduction,
        training_reduction_rate: inputs.trainingReductionRate,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "保存に失敗しました"); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setInputs(defaultInputs);
  }

  const ic = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-right text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400";

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">収益計画シミュレーション</h2>
        <p className="mb-4 text-sm text-gray-500">コスト項目を入力すると、ROI・回収期間・年間効果額がリアルタイムで更新されます</p>

        {/* 業界別プリセット */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">業界テンプレートから始める</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setInputs(preset.inputs)}
                className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                  JSON.stringify(inputs) === JSON.stringify(preset.inputs)
                    ? "border-violet-400 bg-violet-50 font-medium text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-violet-200 hover:bg-violet-50"
                }`}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="ml-1 hidden text-gray-400 sm:inline">— {preset.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* KPI結果カード */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">月間コスト削減額</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">¥{fmt(results.monthlySaving)}</p>
            <p className="text-[10px] text-gray-400">現状比 -{results.reductionRate}%</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">年間効果額</p>
            <p className="mt-1 text-2xl font-bold text-green-600">¥{fmt(results.annualSaving)}</p>
            <p className="text-[10px] text-gray-400">12ヶ月換算</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">ROI</p>
            <p className="mt-1 text-2xl font-bold text-violet-600">{results.roi}%</p>
            <p className="text-[10px] text-gray-400">投資対効果</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">投資回収期間</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{results.paybackMonths >= 999 ? "—" : `${results.paybackMonths}ヶ月`}</p>
            <p className="text-[10px] text-gray-400">初期投資 ¥{fmt(inputs.initialInvestment)}</p>
          </div>
        </div>

        {/* 2カラム: 入力 + グラフ */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* 左: 入力パネル */}
          <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5">
            <h3 className="border-b-2 border-violet-500 pb-2 text-sm font-bold text-violet-600">コスト入力</h3>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">現状コスト</p>
              {([
                ["operatorCost", "オペレーター人材コスト", "万円/月", "コールセンター等のオペレーター全員の月間人件費合計です"],
                ["personMonthCost", "人月コスト", "万円/人月", "オペレーター1人あたりの月間コストです（給与+社保+間接費）"],
                ["monthlyCalls", "月間コール件数", "件/月", "1ヶ月間に対応する問い合わせ・コールの総数です"],
                ["avgCallTime", "1コール平均時間", "分", "1件の問い合わせにかかる平均対応時間です"],
                ["systemCost", "現行システム運用費", "万円/月", "現在使用中のCTI・CRM等のシステム月額費用です"],
                ["trainingCost", "新人教育費用", "万円/年", "年間のオペレーター研修・教育にかかる費用です"],
                ["otherCost", "その他の費用", "万円/月", "上記以外の関連コスト（通信費、設備費等）です"],
              ] as [keyof SimInputs, string, string, string][]).map(([key, label, unit, tip]) => (
                <div key={key} className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-xs text-gray-600 sm:flex-1">{label}<HelpTip text={tip} /></span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={inputs[key]} onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                      className={ic + " w-full sm:w-[110px]"} />
                    <span className="w-14 shrink-0 text-[10px] text-gray-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">AI導入コスト</p>
              {([
                ["initialInvestment", "初期費用（一括）", "万円", "AI導入・カスタマイズにかかる一括費用です"],
                ["monthlyAiCost", "月額費用", "万円/月", "AIシステムの月額利用料（ランニングコスト）です"],
              ] as [keyof SimInputs, string, string, string][]).map(([key, label, unit, tip]) => (
                <div key={key} className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-xs text-gray-600 sm:flex-1">{label}<HelpTip text={tip} /></span>
                  <div className="flex items-center gap-2">
                    <input type="number" value={inputs[key]} onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                      className={ic + " w-full sm:w-[110px]"} />
                    <span className="w-14 shrink-0 text-[10px] text-gray-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">削減見込み</p>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">AI自動化率<HelpTip text="コール対応のうち、AIが自動で処理できる割合の見込みです。60%なら10件中6件をAIが対応します" /></span>
                  <span className="text-sm font-bold text-violet-600">{inputs.automationRate}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={inputs.automationRate}
                  onChange={(e) => update("automationRate", parseInt(e.target.value))}
                  className="w-full accent-violet-600" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex-1 text-xs text-gray-600">人員削減見込み<HelpTip text="AI導入により不要になるオペレーターの人数見込みです" /></span>
                <input type="number" value={inputs.headcountReduction} onChange={(e) => update("headcountReduction", parseFloat(e.target.value) || 0)}
                  className={ic} style={{ width: 110 }} />
                <span className="w-14 text-[10px] text-gray-400">人</span>
              </div>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">教育コスト削減率<HelpTip text="AIがナレッジベースとして機能するため、新人教育にかかるコストを削減できます" /></span>
                  <span className="text-sm font-bold text-violet-600">{inputs.trainingReductionRate}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={inputs.trainingReductionRate}
                  onChange={(e) => update("trainingReductionRate", parseInt(e.target.value))}
                  className="w-full accent-violet-600" />
              </div>
            </div>

            {/* 保存 */}
            <div className="border-t border-gray-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">保存</p>
              <input type="text" value={simName} onChange={(e) => setSimName(e.target.value)}
                className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none" placeholder="シミュレーション名" />
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none" placeholder="企業名（任意）" />
              {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
              {saved && <p className="mb-2 text-xs text-green-600">保存しました</p>}
              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">リセット</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                  {saving ? "保存中..." : "保存する"}
                </button>
              </div>
            </div>
          </div>

          {/* 右: グラフ */}
          <div className="space-y-4">
            {/* 折れ線グラフ: 投資回収 */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">投資回収シミュレーション</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                  <RTooltip formatter={(value) => [`¥${Number(value).toLocaleString()}万`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="cumulativeSaving" name="累積コスト削減額" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="cumulativeInvestment" name="累積投資額" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  {paybackPoint && (
                    <ReferenceDot x={paybackPoint.label} y={paybackPoint.cumulativeSaving} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
              {paybackPoint && (
                <p className="mt-2 text-center text-xs text-violet-600 font-medium">
                  回収完了ポイント: {results.paybackMonths}ヶ月目
                </p>
              )}
            </div>

            {/* 棒グラフ: 月次比較 */}
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h4 className="mb-4 text-sm font-semibold text-gray-700">月次コスト比較（導入前 vs 導入後）</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={costComparison} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                  <RTooltip formatter={(value) => [`¥${Number(value).toLocaleString()}万`, ""]} />
                  <Legend />
                  <Bar dataKey="before" name="導入前" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" name="導入後" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* コスト内訳サマリー */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
                <p className="text-xs text-gray-400">現状月間コスト</p>
                <p className="mt-1 text-xl font-bold text-gray-900">¥{fmt(results.currentMonthlyCost)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-green-50 p-4 text-center">
                <p className="text-xs text-gray-400">導入後月間コスト</p>
                <p className="mt-1 text-xl font-bold text-green-600">¥{fmt(results.afterMonthlyCost)}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-violet-50 p-4 text-center">
                <p className="text-xs text-gray-400">月間削減額</p>
                <p className="mt-1 text-xl font-bold text-violet-600">¥{fmt(results.monthlySaving)}</p>
                <p className="text-[10px] text-violet-500">-{results.reductionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
