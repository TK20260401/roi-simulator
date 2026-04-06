"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppShell from "@/components/app-shell";

type KGI = { id: string; title: string; target_value: number; unit: string; deadline: string };
type KPI = { id: string; kgi_id: string; title: string; target_value: number; unit: string; deadline: string };

export default function KpiPage() {
  const supabase = createClient();
  const [kgis, setKgis] = useState<KGI[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [newKgi, setNewKgi] = useState({ title: "", target_value: "", unit: "%", deadline: "" });
  const [newKpi, setNewKpi] = useState({ kgi_id: "", title: "", target_value: "", unit: "%", deadline: "" });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const { data: k1 } = await supabase.from("kgi_goals").select("*").order("created_at", { ascending: false });
    const { data: k2 } = await supabase.from("kpi_metrics").select("*").order("created_at", { ascending: false });
    setKgis((k1 ?? []) as KGI[]);
    setKpis((k2 ?? []) as KPI[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function addKgi() {
    if (!newKgi.title.trim()) return;
    await supabase.from("kgi_goals").insert({
      title: newKgi.title,
      target_value: parseFloat(newKgi.target_value) || 0,
      unit: newKgi.unit, deadline: newKgi.deadline || null,
    });
    setNewKgi({ title: "", target_value: "", unit: "%", deadline: "" });
    loadData();
  }

  async function addKpi() {
    if (!newKpi.title.trim() || !newKpi.kgi_id) return;
    await supabase.from("kpi_metrics").insert({
      kgi_id: newKpi.kgi_id, title: newKpi.title,
      target_value: parseFloat(newKpi.target_value) || 0,
      unit: newKpi.unit, deadline: newKpi.deadline || null,
    });
    setNewKpi({ kgi_id: "", title: "", target_value: "", unit: "%", deadline: "" });
    loadData();
  }

  async function deleteKgi(id: string) {
    await supabase.from("kgi_goals").delete().eq("id", id);
    loadData();
  }

  async function deleteKpi(id: string) {
    await supabase.from("kpi_metrics").delete().eq("id", id);
    loadData();
  }

  const ic = "rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400";

  if (loading) return <AppShell><div className="flex h-full items-center justify-center"><p className="text-gray-400">読み込み中...</p></div></AppShell>;

  return (
    <AppShell>
      <div className="px-6 py-8 sm:px-10">
        <h2 className="text-2xl font-bold text-gray-900">KGI/KPI管理</h2>
        <p className="mb-8 mt-1 text-sm text-gray-500">目標（KGI）と中間指標（KPI）の設定・管理</p>

        {/* KGI追加 */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">KGI（最終目標）を追加</h3>
          <div className="flex flex-wrap gap-2">
            <input type="text" value={newKgi.title} onChange={(e) => setNewKgi({ ...newKgi, title: e.target.value })} className={ic + " flex-1"} placeholder="例: 年間コスト30%削減" />
            <input type="number" value={newKgi.target_value} onChange={(e) => setNewKgi({ ...newKgi, target_value: e.target.value })} className={ic + " w-20"} placeholder="目標値" />
            <select value={newKgi.unit} onChange={(e) => setNewKgi({ ...newKgi, unit: e.target.value })} className={ic + " w-20"}>
              <option value="%">%</option><option value="万円">万円</option><option value="人">人</option><option value="件">件</option>
            </select>
            <input type="date" value={newKgi.deadline} onChange={(e) => setNewKgi({ ...newKgi, deadline: e.target.value })} className={ic + " w-40"} />
            <button onClick={addKgi} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">追加</button>
          </div>
        </div>

        {/* KGI一覧 + 配下KPI */}
        {kgis.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-12 text-center text-gray-400">
            KGIがまだありません。上のフォームから追加してください。
          </div>
        ) : (
          <div className="space-y-6">
            {kgis.map((kgi) => {
              const childKpis = kpis.filter((k) => k.kgi_id === kgi.id);
              return (
                <div key={kgi.id} className="rounded-xl border border-gray-100 bg-white p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">KGI</span>
                      <h4 className="mt-1 text-base font-semibold text-gray-900">{kgi.title}</h4>
                      <p className="text-xs text-gray-400">目標: {kgi.target_value}{kgi.unit} {kgi.deadline && `| 期限: ${kgi.deadline}`}</p>
                    </div>
                    <button onClick={() => deleteKgi(kgi.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
                  </div>

                  {/* 配下KPI */}
                  {childKpis.length > 0 && (
                    <div className="mb-3 ml-4 space-y-2 border-l-2 border-violet-100 pl-4">
                      {childKpis.map((kpi) => (
                        <div key={kpi.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div>
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">KPI</span>
                            <span className="ml-2 text-sm text-gray-700">{kpi.title}</span>
                            <span className="ml-2 text-xs text-gray-400">目標: {kpi.target_value}{kpi.unit}</span>
                          </div>
                          <button onClick={() => deleteKpi(kpi.id)} className="text-xs text-red-400 hover:text-red-600">削除</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* KPI追加 */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input type="text" value={newKpi.kgi_id === kgi.id ? newKpi.title : ""} onChange={(e) => setNewKpi({ ...newKpi, kgi_id: kgi.id, title: e.target.value })}
                      className={ic + " flex-1"} placeholder="KPIを追加（例: 月間AI対応率）" />
                    <input type="number" value={newKpi.kgi_id === kgi.id ? newKpi.target_value : ""} onChange={(e) => setNewKpi({ ...newKpi, kgi_id: kgi.id, target_value: e.target.value })}
                      className={ic + " w-20"} placeholder="目標値" />
                    <button onClick={() => { setNewKpi({ ...newKpi, kgi_id: kgi.id }); addKpi(); }}
                      className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-medium text-violet-600 hover:bg-violet-50">+ KPI追加</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
