"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  }

  async function handleSignUp() {
    if (!email || !password || password.length < 6) { setError("メールアドレスと6文字以上のパスワードを入力してください。"); return; }
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(error.message); setLoading(false); return; }
    setError("確認メールを送信しました。メールを確認してください。"); setLoading(false);
  }

  const ic = "mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400";

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-violet-600">AI Strategy Agent</h1>
          <p className="mt-2 text-sm text-gray-500">収益計画シミュレーション・KGI/KPI管理</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={ic} placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">パスワード</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={ic} placeholder="6文字以上" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {loading ? "処理中..." : "ログイン"}
          </button>
          <button type="button" onClick={handleSignUp} disabled={loading} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            新規登録
          </button>
        </form>
      </div>
    </div>
  );
}
