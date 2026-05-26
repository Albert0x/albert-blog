"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, LogOut, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// 老王说明：后台顶部导航
// - 显示当前用户头像 + 登出
// - 文章列表 / 新建文章 tab
// - 「查看博客」快速跳转
interface AdminNavProps {
  user: {
    name?: string | null;
    image?: string | null;
    githubLogin?: string;
  };
  signOutAction: () => Promise<void>;
}

export function AdminNav({ user, signOutAction }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "文章管理", icon: FileText, exact: true },
    { href: "/admin/new", label: "新建文章", icon: Plus },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* 左侧：Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 group">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand text-white font-bold text-xs shadow-md group-hover:scale-110 transition-transform">
              A
            </span>
            <span className="font-semibold text-sm">博客后台</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                    active
                      ? "bg-gradient-brand-soft text-brand"
                      : "text-muted hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 右侧：查看博客 + 用户 + 登出 */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-muted hover:text-brand transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            查看博客
          </Link>
          <Link
            href="/"
            className="sm:hidden grid place-items-center h-8 w-8 rounded-md text-muted hover:text-foreground hover:bg-foreground/5"
            aria-label="返回博客"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {user.image && (
            <img
              src={user.image}
              alt={user.name ?? user.githubLogin ?? "user"}
              className="h-7 w-7 rounded-full border border-border/60"
            />
          )}

          <form action={signOutAction}>
            <button
              type="submit"
              className="grid place-items-center h-8 w-8 rounded-md text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              aria-label="登出"
              title="登出"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
