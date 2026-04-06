"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const [inputs, setInputs] = useState<SimInputs | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("simulations").select("*").eq("id", id).single();
      if (!data) { setLoading(false); return; }
      setName(data.name);
      setInputs({
        operatorCost: Number(data.operator_cost), personMonthCost: Number(data.person_month_cost),
        monthlyCalls: data.monthly_calls, avgCallTime: Number(data.avg_call_time),
        systemCost: Number(data.system_cost), trainingCost: Number(data.training_cost),
        otherCost: Number(data.other_cost), initialInvestment: Number(data.initial_investment),
        monthlyAiCost: Number(data.monthly_ai_cost), automationRate: data.automation_rate,
        headcountReduction: data.headcount_reduction, trainingReductionRate: data.training_reduction_rate,
      });
      setLoading(false);
    }
    load();
  }, [id, supabase]);

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
      <div className="px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">保存済みシミュレーション</p>
          </div>
          <button onClick={() => router.push("/history")} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">一覧に戻る</button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">月間コスト削減額</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">¥{fmt(results.monthlySaving)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">年間効果額</p>
            <p className="mt-1 text-2xl font-bold text-green-600">¥{fmt(results.annualSaving)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">ROI</p>
            <p className="mt-1 text-2xl font-bold text-violet-600">{results.roi}%</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400">投資回収期間</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{results.paybackMonths >= 999 ? "—" : `${results.paybackMonths}ヶ月`}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5">
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
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h4 className="mb-4 text-sm font-semibold text-gray-700">月次コスト比較</h4>
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
      </div>
    </AppShell>
  );
}
