"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SearchButton } from "@/components/search/SearchButton";
import { cn } from "@/lib/utils";

// 老王说明：顶部毛玻璃导航
// - 滚动后加强阴影和背景饱和度
// - 移动端汉堡菜单
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-border/60 shadow-[0_4px_24px_-12px_rgba(99,102,241,0.18)]"
          : "bg-transparent"
      )}
    >
      <Container size="wide">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            onClick={() => setMenuOpen(false)}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white font-bold text-sm shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform">
              A
            </span>
            <span className="font-semibold tracking-tight hidden sm:inline">
              {siteConfig.name}
              <span className="text-muted ml-1 font-normal">.dev</span>
            </span>
          </Link>

          {/* 桌面端导航 */}
          <ul className="hidden md:flex items-center gap-1">
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-sm rounded-md transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-gradient-brand rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 右侧操作 */}
          <div className="flex items-center gap-2">
            {/* 老王说明：站内搜索 - 长条按钮 + Ctrl/Cmd+K + / 三种触发 */}
            <SearchButton />
            {/* 老王说明：主题切换按钮 - 桌面 + 移动端都显示 */}
            <ThemeToggle />
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:grid place-items-center h-9 w-9 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            {/* 老王说明：右上头像 → 点击跳关于页，悬浮放大 + 渐变光圈 */}
            <Link
              href="/about"
              className="hidden md:inline-flex items-center group"
              aria-label="关于我"
              onClick={() => setMenuOpen(false)}
            >
              <Avatar size="sm" className="group-hover:ring-2 ring-brand/40 transition-all group-hover:scale-110" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden grid place-items-center h-9 w-9 rounded-md hover:bg-foreground/5"
              aria-label="菜单"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* 移动端折叠菜单 */}
        {menuOpen && (
          <ul className="md:hidden pb-4 flex flex-col gap-1 border-t border-border/60 pt-3">
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-gradient-brand-soft text-foreground"
                        : "text-muted hover:bg-foreground/5"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </header>
  );
}
