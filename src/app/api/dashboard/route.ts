import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("basic_auth")?.value === "authenticated";
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const supabase = await createClient();

  const [countsRes, recentRes, kgiCountRes] = await Promise.all([
    supabase.rpc("get_simulations_count"),
    supabase.rpc("get_simulations", { p_limit: 5 }),
    supabase.rpc("get_kgi_count"),
  ]);

  return NextResponse.json({
    total: countsRes.data?.[0]?.total ?? 0,
    thisMonth: countsRes.data?.[0]?.this_month ?? 0,
    kgiCount: kgiCountRes.data ?? 0,
    recent: recentRes.data ?? [],
  });
}
