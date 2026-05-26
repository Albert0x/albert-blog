"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

// 老王说明：主题切换按钮 - 三态轮换
// 亮色 (sun) → 暗色 (moon) → 跟随系统 (monitor) → 亮色 ...
// 避免 SSR hydration 错误：在 mounted 之前显示骨架，等客户端确定主题后再渲染
const ORDER = ["light", "dark", "system"] as const;
const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;
const LABELS = {
  light: "切换到暗色模式",
  dark: "切换到跟随系统",
  system: "切换到亮色模式",
} as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 客户端 mount 后才显示真实图标，避免 SSR 闪烁
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // 占位骨架，保持布局稳定
    return (
      <div
        className={cn(
          "grid place-items-center h-9 w-9 rounded-md",
          className
        )}
        aria-hidden
      />
    );
  }

  // 老王说明：theme 可能是 light / dark / system / undefined
  const current = (ORDER as readonly string[]).includes(theme ?? "")
    ? (theme as (typeof ORDER)[number])
    : "system";
  const Icon = ICONS[current];

  const handleToggle = () => {
    const idx = ORDER.indexOf(current);
    const next = ORDER[(idx + 1) % ORDER.length];
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "grid place-items-center h-9 w-9 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors",
        className
      )}
      aria-label={LABELS[current]}
      title={LABELS[current]}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
