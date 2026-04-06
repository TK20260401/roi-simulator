"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-display-name": displayName || username },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.message || "IDまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const ic = "mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400";

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-violet-600">AI Strategy Agent</h1>
          <p className="mt-2 text-sm text-gray-500">収益計画シミュレーション・KGI/KPI管理</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">表示名</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className={ic} placeholder="例: 田中太郎（他ユーザーに表示されます）" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ユーザーID</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className={ic} placeholder="ユーザーIDを入力" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={ic} placeholder="パスワードを入力" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {loading ? "処理中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
