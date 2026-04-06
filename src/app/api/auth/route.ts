import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUser = process.env.BASIC_AUTH_USER;
  const validPass = process.env.BASIC_AUTH_PASSWORD;

  if (username === validUser && password === validPass) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("basic_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });
    return response;
  }

  return NextResponse.json({ success: false, message: "IDまたはパスワードが正しくありません" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("basic_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
