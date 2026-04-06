import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("basic_auth")?.value === "authenticated";
}

// 一覧取得
export async function GET(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const supabase = await createClient();

  if (id) {
    const { data, error } = await supabase.rpc("get_simulation_by_id", { p_id: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data?.[0] ?? null);
  }

  const limit = parseInt(searchParams.get("limit") ?? "100");
  const { data, error } = await supabase.rpc("get_simulations", { p_limit: limit });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

// 新規作成
export async function POST(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("insert_simulation", {
    p_name: body.name,
    p_company_name: body.company_name || null,
    p_created_by_name: body.created_by_name || null,
    p_operator_cost: body.operator_cost,
    p_person_month_cost: body.person_month_cost,
    p_monthly_calls: body.monthly_calls,
    p_avg_call_time: body.avg_call_time,
    p_system_cost: body.system_cost,
    p_training_cost: body.training_cost,
    p_other_cost: body.other_cost,
    p_initial_investment: body.initial_investment,
    p_monthly_ai_cost: body.monthly_ai_cost,
    p_automation_rate: body.automation_rate,
    p_headcount_reduction: body.headcount_reduction,
    p_training_reduction_rate: body.training_reduction_rate,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data });
}

// 削除
export async function DELETE(request: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const { id } = await request.json();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_simulation", { p_id: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
