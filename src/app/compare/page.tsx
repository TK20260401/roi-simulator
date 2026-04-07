"use client";

import { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/app-shell";
import { calculate, generateCostComparison, type SimInputs, type SimResults } from "@/lib/calc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type SimRecord = {
  id: string;
  name: string;
  company_name: string | null;
  created_by_name: string | null;
  created_at: string;
  operator_count: number;
  operator_cost: number;
  person_month_cost: number;
  monthly_calls: number;
  avg_call_time: number;
  system_cost: number;
  training_cost: number;
  other_cost: number;
  initial_investment: number;
  monthly_ai_cost: number;
  monthly_api_cost: number;
  automation_rate: number;
  headcount_reduction: number;
  training_reduction_rate: number;
};

function toInputs(s: SimRecord): SimInputs {
  const operatorCount = Number(s.operator_count ?? 0);
  const personMonthCost = Number(s.person_month_cost);
  return {
    operatorCount,
    operatorCost: operatorCount > 0 ? operatorCount * personMonthCost : Number(s.operator_cost),
    personMonthCost,
    monthlyCalls: s.monthly_calls, avgCallTime: Number(s.avg_call_time),
    systemCost: Number(s.system_cost), trainingCost: Number(s.training_cost),
    otherCost: Number(s.other_cost), initialInvestment: Number(s.initial_investment),
    monthlyAiCost: Number(s.monthly_ai_cost), monthlyApiCost: Number(s.monthly_api_cost ?? 0),
    automationRate: s.automation_rate,
    headcountReduction: s.headcount_reduction, trainingReductionRate: s.training_reduction_rate,
  };
}

function fmt(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}億`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}千万`;
  return `${v}万`;
}

const COLORS = ["#7c3aed", "#2563eb", "#16a34a", "#ea580c"];

export default function ComparePage() {
  const [allSims, setAllSims] = useState<SimRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulations").then(r => r.json()).then(d => { setAllSims(d); setLoading(false); });
  }, []);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  const compared = useMemo(() => {
    return selectedIds.map((id) => {
      const sim = allSims.find((s) => s.id === id)!;
      const inputs = toInputs(sim);
      const results = calculate(inputs);
      return { sim, inputs, results };
    });
  }, [selectedIds, allSims]);

  // 比較用棒グラフデータ
  const compareChartData = useMemo(() => {
    if (compared.length === 0) return [];
    const metrics = [
      { key: "monthlySaving", label: "月間削減額" },
      { key: "annualSaving", label: "年間効果額" },
      { key: "roi", label: "ROI(%)" },
      { key: "paybackMonths", label: "回収期間(月)" },
    ];
    return metrics.map((m) => {
      const row: Record<string, string | number> = { name: m.label };
      compared.forEach((c, i) => {
        const val = c.results[m.key as keyof SimResults];
        row[`plan${i}`] = typeof val === "number" && val < 999 ? val : 0;
      });
      return row;
    });
  }, [compared]);

  // コスト比較データ
  const costCompareData = useMemo(() => {
    if (compared.length === 0) return [];
    const categories = ["人件費", "システム", "教育費", "その他"];
    return categories.map((cat, ci) => {
      const row: Record<string, string | number> = { name: cat };
      compared.forEach((c, i) => {
        const costs = generateCostComparison(c.inputs, c.results);
        row[`plan${i}`] = costs[ci]?.after ?? 0;
      });
      return row;
    });
  }, [compared]);

  if (loading) return <AppShell><div className="flex h-full items-center justify-center"><p className="text-gray-400">読み込み中...</p></div></AppShell>;

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">シミュレーション比較</h2>
        <p className="mb-6 text-sm text-gray-500">最大4つのシミュレーションを横並びで比較できます</p>

        {/* 選択パネル */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            比較するシミュレーションを選択（{selectedIds.length}/4）
          </p>
          {allSims.length === 0 ? (
            <p className="text-sm text-gray-400">保存済みシミュレーションがありません</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allSims.map((sim, i) => {
                const isSelected = selectedIds.includes(sim.id);
                const colorIdx = selectedIds.indexOf(sim.id);
                return (
                  <button
                    key={sim.id}
                    onClick={() => toggleSelect(sim.id)}
                    disabled={!isSelected && selectedIds.length >= 4}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? "border-violet-400 bg-violet-50 font-medium text-violet-700"
                        : "border-gray-200 text-gray-600 hover:border-violet-200 disabled:opacity-30"
                    }`}
                  >
                    {isSelected && (
                      <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[colorIdx] }} />
                    )}
                    {sim.name}
                    {sim.company_name && <span className="ml-1 text-gray-400">({sim.company_name})</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {compared.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-20">
            <p className="text-gray-400">上のボタンからシミュレーションを選択してください</p>
          </div>
        ) : (
          <>
            {/* KPIカード比較 */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 pr-4 text-left font-medium text-gray-600">指標</th>
                    {compared.map((c, i) => (
                      <th key={c.sim.id} className="py-3 px-3 text-right font-medium" style={{ color: COLORS[i] }}>
                        {c.sim.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">月間コスト削減額</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right font-bold" style={{ color: COLORS[i] }}>
                        ¥{fmt(c.results.monthlySaving)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">年間効果額</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right font-bold" style={{ color: COLORS[i] }}>
                        ¥{fmt(c.results.annualSaving)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">ROI</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right font-bold" style={{ color: COLORS[i] }}>
                        {c.results.roi}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">投資回収期間</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right font-bold" style={{ color: COLORS[i] }}>
                        {c.results.paybackMonths >= 999 ? "—" : `${c.results.paybackMonths}ヶ月`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">初期投資</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right text-gray-500">
                        ¥{fmt(c.inputs.initialInvestment)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">AI自動化率</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right text-gray-500">
                        {c.inputs.automationRate}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-gray-600">削減率</td>
                    {compared.map((c, i) => (
                      <td key={c.sim.id} className="py-3 px-3 text-right font-medium text-green-600">
                        -{c.results.reductionRate}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* グラフ比較 */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h4 className="mb-4 text-sm font-semibold text-gray-700">主要指標の比較</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={compareChartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {compared.map((c, i) => (
                      <Bar key={c.sim.id} dataKey={`plan${i}`} name={c.sim.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <h4 className="mb-4 text-sm font-semibold text-gray-700">導入後コスト比較（月間）</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costCompareData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                    <Tooltip formatter={(value) => [`¥${Number(value).toLocaleString()}万`, ""]} />
                    <Legend />
                    {compared.map((c, i) => (
                      <Bar key={c.sim.id} dataKey={`plan${i}`} name={c.sim.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
