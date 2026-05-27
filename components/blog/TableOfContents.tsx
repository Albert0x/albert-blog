"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

// 老王说明：文章目录组件
// - 桌面端（xl+）：右侧浮动 sticky 边栏，跟随滚动高亮 + 阅读进度条
// - 移动端：左下角浮动小按钮，点开弹出抽屉
// - 用 IntersectionObserver 检测当前章节（视口 20% ~ 30% 区域为「中心」）
// - 点击平滑滚动到对应章节
interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 老王说明：IntersectionObserver 监听所有标题元素
  // rootMargin -20% 0% -70% 0% = 把"激活区"限制在视口上方 20%~30% 这一窄带
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 收集当前可见的标题
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);
        if (visible.length > 0) {
          // 取按文档顺序第一个
          const first = items.find((it) => visible.includes(it.id));
          if (first) setActiveId(first.id);
        }
      },
      {
        rootMargin: "-20% 0% -70% 0%",
        threshold: 0,
      }
    );

    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  // 老王说明：滚动进度（百分比）
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // 滚动到目标位置，留出 navbar 高度
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
    setMobileOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* ============== 桌面端：左侧 sticky 边栏 ============== */}
      <aside className="hidden xl:block fixed top-24 left-4 2xl:left-12 w-56 max-h-[calc(100vh-8rem)] z-20">
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-4 max-h-[calc(100vh-8rem)] flex flex-col">
          {/* 标题 + 进度 */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/40">
            <List className="h-4 w-4 text-brand" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              目录
            </span>
            <span className="ml-auto text-[10px] text-muted tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>

          {/* 进度条 */}
          <div className="h-0.5 bg-border/40 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-brand transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 目录列表 */}
          <nav className="overflow-y-auto flex-1 -mr-2 pr-2">
            <ul className="space-y-1 text-sm">
              {items.map((it) => (
                <TocLink
                  key={it.id}
                  item={it}
                  active={activeId === it.id}
                  onClick={() => handleJump(it.id)}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* ============== 移动端 / 平板：右下角浮动按钮（避开 AI 助手按钮位置） ============== */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="打开目录"
        className="xl:hidden fixed bottom-24 left-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-card border border-border/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <List className="h-5 w-5 text-brand" />
        {/* 进度环 */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand/20"
          />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="url(#tocGradient)"
            strokeWidth="2"
            strokeDasharray={`${(progress / 100) * 138} 138`}
            strokeLinecap="round"
            className="transition-all duration-150"
          />
          <defs>
            <linearGradient id="tocGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
      </button>

      {/* ============== 移动端抽屉 ============== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="xl:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="xl:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-background border-r border-border/60 flex flex-col"
            >
              <header className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-brand" />
                  <span className="text-sm font-semibold">目录</span>
                  <span className="text-[10px] text-muted tabular-nums">
                    · {Math.round(progress)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid place-items-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-foreground/5"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="h-0.5 bg-border/40 mx-4 my-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1 text-sm">
                  {items.map((it) => (
                    <TocLink
                      key={it.id}
                      item={it}
                      active={activeId === it.id}
                      onClick={() => handleJump(it.id)}
                    />
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// 老王说明：单条目录链接 - h3 缩进，激活状态有渐变色 + 左侧色条
function TocLink({
  item,
  active,
  onClick,
}: {
  item: TocItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex items-start gap-1 w-full text-left py-1 px-2 rounded-md transition-colors leading-snug",
          item.level === 3 && "pl-6 text-xs",
          item.level === 2 && "text-sm font-medium",
          active
            ? "bg-gradient-brand-soft text-brand"
            : "text-muted hover:text-foreground hover:bg-foreground/5"
        )}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 mt-1 shrink-0 transition-all",
            active
              ? "opacity-100 translate-x-0 text-brand"
              : "opacity-0 -translate-x-1"
          )}
        />
        <span className="line-clamp-2">{item.text}</span>
      </button>
    </li>
  );
}
