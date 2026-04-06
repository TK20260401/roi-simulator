import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/app-shell";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sims } = await supabase
    .from("simulations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="px-6 py-8 sm:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">シミュレーション履歴</h2>
            <p className="mt-1 text-sm text-gray-500">保存済みシミュレーションの一覧</p>
          </div>
          <Link href="/simulations/new" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
            + 新規作成
          </Link>
        </div>

        {(sims ?? []).length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-16">
            <p className="text-gray-400">まだシミュレーションがありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">名前</th>
                  <th className="px-4 py-3 font-medium text-gray-600">企業名</th>
                  <th className="px-4 py-3 font-medium text-gray-600">作成日</th>
                  <th className="px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(sims ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.company_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString("ja-JP")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/simulations/${s.id}`} className="text-violet-600 hover:underline">詳細</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
