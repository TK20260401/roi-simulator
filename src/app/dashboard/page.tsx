import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppShell from "@/components/app-shell";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("simulations").select("*", { count: "exact", head: true });

  const firstOfMonth = new Date(); firstOfMonth.setDate(1); firstOfMonth.setHours(0,0,0,0);
  const { count: monthCount } = await supabase
    .from("simulations").select("*", { count: "exact", head: true }).gte("created_at", firstOfMonth.toISOString());

  const { data: recent } = await supabase
    .from("simulations").select("id, name, company_name, created_at").order("created_at", { ascending: false }).limit(5);

  const { count: kgiCount } = await supabase
    .from("kgi_goals").select("*", { count: "exact", head: true });

  return (
    <AppShell>
      <div className="px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="mb-8 mt-1 text-sm text-gray-500">AI戦略シミュレーション・KGI/KPI管理</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">シミュレーション数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">今月の作成数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{monthCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">KGI目標数</p>
            <p className="mt-1 text-3xl font-bold text-violet-600">{kgiCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">クイックアクション</p>
            <Link href="/simulations/new" className="mt-2 inline-block rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700">
              新規シミュレーション
            </Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">最近のシミュレーション</h3>
          <Link href="/history" className="text-sm text-gray-500 hover:text-gray-700">すべて表示 →</Link>
        </div>

        {(recent ?? []).length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-16">
            <p className="mb-4 text-gray-400">まだシミュレーションがありません</p>
            <Link href="/simulations/new" className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700">
              最初のシミュレーションを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(recent ?? []).map((s) => (
              <Link key={s.id} href={`/simulations/${s.id}`} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  {s.company_name && <p className="text-xs text-gray-400">{s.company_name}</p>}
                </div>
                <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString("ja-JP")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
