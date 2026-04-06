import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("basic_auth")?.value === "authenticated";
}

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("insert_kgi", {
    p_title: body.title,
    p_target_value: body.target_value,
    p_unit: body.unit,
    p_deadline: body.deadline || null,
    p_created_by_name: body.created_by_name || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data });
}

export async function DELETE(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await request.json();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_kgi", { p_id: id });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
