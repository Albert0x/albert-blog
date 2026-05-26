"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// 老王说明：把 next-themes 的 ThemeProvider 封一层 Client Component
// - attribute="class" → 切换时给 <html> 加 / 去 .dark 类（配合 Tailwind 的 darkMode: "class"）
// - defaultTheme="system" → 默认跟随系统设置
// - enableSystem → 允许「跟随系统」这个选项
// - disableTransitionOnChange → 切换瞬间禁用过渡动画，避免页面闪烁
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
