"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

// 老王说明：AI 助手主入口
// - 右下角固定浮动按钮（FAB）+ 渐变光晕呼吸动画
// - 点击打开 ChatPanel
// - 移动端 / 桌面端自适应布局
export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 浮动按钮 - z-50 保证总在最上层 */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white shadow-xl shadow-brand/40 group",
          "hover:shadow-2xl hover:shadow-brand/50 transition-shadow"
        )}
        aria-label={open ? "关闭 AI 助手" : "打开 AI 助手"}
      >
        {/* 呼吸光晕 */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-gradient-brand opacity-60 blur-md animate-pulse" />
        )}

        <span className="relative">
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <Sparkles className="h-6 w-6" />
          )}
        </span>

        {/* 提示气泡（首次访问引导，仅未打开时显示）*/}
        {!open && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-card border border-border/60 px-3 py-1.5 text-xs text-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ✨ AI 助手
          </span>
        )}
      </motion.button>

      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
