import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 老王说明：路由守卫
// - 未登录访问 /admin/* → 重定向到 /login
// - 已登录访问 /login → 跳到 /admin 首页
// - login 页放在 /login 而非 /admin/login，避免被 admin/layout 守卫造成死循环
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  // 已登录还在登录页 → 跳到管理首页
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 未登录访问 /admin/* → 跳登录页（带 from 回跳参数）
  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // 老王说明：matcher 拦截 /admin/* 和 /login 两个路径
  // /login 也拦截是为了「已登录用户访问登录页时自动跳到 /admin」
  matcher: ["/admin/:path*", "/login"],
};
