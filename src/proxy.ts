import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiAuth = request.nextUrl.pathname === "/api/auth";

  // ログインページと認証APIはスルー
  if (isLoginPage || isApiAuth) {
    return NextResponse.next();
  }

  // Cookieで認証チェック
  const authCookie = request.cookies.get("basic_auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
