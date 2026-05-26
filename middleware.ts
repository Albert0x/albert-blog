import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 老王说明：路由守卫 - 拦截 /admin/* 未登录访问
// - 未登录 → 重定向到 /admin/login
// - 已登录访问 /admin/login → 跳到 /admin 首页
// - 静态资源不拦截（matcher 配好了）
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  // 已登录还在登录页 → 跳到管理首页
  if (pathname === "/admin/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 未登录访问 /admin/* 但不是 /admin/login → 跳登录页（带 from 回跳参数）
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !isLoggedIn
  ) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // 老王说明：matcher 只拦截 /admin/* 路径，其他页面（公开博客）完全不受影响
  matcher: ["/admin/:path*"],
};
