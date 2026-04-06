"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/app-shell";

type DashData = {
  total: number;
  thisMonth: number;
  kgiCount: number;
  recent: { id: string; name: string; company_name: string | null; created_by_name: string | null; created_at: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <AppShell><div className="flex h-full items-center justify-center"><p className="text-gray-400">読み込み中...</p></div></AppShell>;

  return (
    <AppShell>
      <div className="px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <p className="mb-8 mt-1 text-sm text-gray-500">AI戦略シミュレーション・KGI/KPI管理</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">シミュレーション数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{data.total}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">今月の作成数</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{data.thisMonth}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <p className="text-sm text-gray-500">KGI目標数</p>
            <p className="mt-1 text-3xl font-bold text-violet-600">{data.kgiCount}</p>
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

        {data.recent.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-16">
            <p className="mb-4 text-gray-400">まだシミュレーションがありません</p>
            <Link href="/simulations/new" className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700">
              最初のシミュレーションを作成
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recent.map((s) => (
              <Link key={s.id} href={`/simulations/${s.id}`} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.company_name && <span>{s.company_name}</span>}
                    {s.created_by_name && <span>{s.company_name ? " | " : ""}作成者: {s.created_by_name}</span>}
                  </p>
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
