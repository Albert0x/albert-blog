"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "./SearchDialog";

// 老王说明：导航栏搜索按钮
// - 桌面端：长条样式 + 显示 ⌘K 快捷键提示
// - 移动端：纯图标按钮
// - 注册全局 keydown 监听 Ctrl/Cmd + K
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // 老王说明：检测 Mac 与否（用于显示正确的快捷键提示）
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  // 老王说明：全局快捷键
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl+K / Cmd+K 打开
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      // 单独的 / 键也能打开（GitHub / Vercel 风格）
      // 但要排除在 input/textarea 里打字的情况
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName.toLowerCase();
        const isTyping =
          tag === "input" ||
          tag === "textarea" ||
          target?.isContentEditable;
        if (!isTyping) {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* 桌面端：长条搜索按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border/60 bg-card/60 hover:border-brand/40 hover:bg-gradient-brand-soft text-xs text-muted hover:text-foreground transition-all"
        aria-label="搜索文章 (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">搜索文章...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded border border-border/60 bg-background/60 text-[10px] font-mono">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </button>

      {/* 移动端：纯图标 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden grid place-items-center h-9 w-9 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
        aria-label="搜索文章"
      >
        <Search className="h-4 w-4" />
      </button>

      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
