"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Loader2, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import { ChatMessage, ChatWelcome } from "./ChatMessage";
import { cn } from "@/lib/utils";

// 老王说明：聊天面板 - 弹窗式
// - 顶部：标题 + 关闭 + 清空对话
// - 中部：消息流（带流式打字）
// - 底部：输入框 + 发送按钮
interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

// 老王说明：从 UIMessage 的 parts 提取纯文本
function extractText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text as string)
    .join("");
}

// 老王说明：从 UIMessage metadata 提取检索源
interface Source {
  slug: string;
  title: string;
  category: string;
}
function extractSources(message: { metadata?: unknown }): Source[] {
  const meta = message.metadata as { sources?: Source[] } | undefined;
  return meta?.sources ?? [];
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { messages, sendMessage, status, setMessages, error } = useChat();
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false); // 老王说明：最大化模式开关（桌面端有效）
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === "submitted" || status === "streaming";

  // 老王说明：消息更新时自动滚到底
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // 老王说明：打开面板时聚焦输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  // 老王说明：按 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isStreaming) return;
    sendMessage({ text: content });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩（仅移动端显示）*/}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          />
          {/* 主面板 */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              "fixed z-50 flex flex-col rounded-2xl border border-border/60 bg-background shadow-2xl shadow-brand/20",
              // 桌面：默认右下 440×640，最大化时几乎占满
              expanded
                ? "md:inset-6 md:w-auto md:h-auto md:max-w-[1100px] md:max-h-[800px] md:mx-auto md:my-auto"
                : "md:bottom-24 md:right-6 md:w-[440px] md:h-[640px]",
              // 移动端：始终全屏底部抽屉
              "inset-x-2 bottom-2 top-16 md:top-auto md:inset-x-auto"
            )}
          >
            {/* 顶部栏 */}
            <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h2 className="text-sm font-semibold">AI 助手</h2>
                <span className="text-[10px] text-muted">DeepSeek 驱动</span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="grid place-items-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                    aria-label="清空对话"
                    title="清空对话"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {/* 老王说明：最大化 / 还原按钮（仅桌面端可见） */}
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="hidden md:grid place-items-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label={expanded ? "还原" : "最大化"}
                  title={expanded ? "还原" : "最大化"}
                >
                  {expanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid place-items-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* 消息流 */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
            >
              {messages.length === 0 ? (
                <ChatWelcome onPickSuggestion={(t) => handleSend(t)} />
              ) : (
                <div className="py-2">
                  {messages.map((m, i) => {
                    const isLast = i === messages.length - 1;
                    return (
                      <ChatMessage
                        key={m.id}
                        role={m.role as "user" | "assistant"}
                        content={extractText(m)}
                        sources={extractSources(m)}
                        streaming={isLast && m.role === "assistant" && isStreaming}
                      />
                    );
                  })}
                  {status === "submitted" && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 px-4 py-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white shadow-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                      <div className="rounded-2xl px-4 py-2.5 bg-card border border-border/60 text-sm text-muted">
                        思考中...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="mx-4 my-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-rose-500">
                    出错了：{error.message || "请稍后重试"}
                  </div>
                </div>
              )}
            </div>

            {/* 输入栏 */}
            <footer className="border-t border-border/60 p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border/60 bg-card focus-within:border-brand/60 transition-colors p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="问点啥，比如：你做过什么工业项目？"
                  rows={1}
                  className="flex-1 resize-none bg-transparent outline-none text-sm placeholder:text-muted/60 max-h-24"
                  disabled={isStreaming}
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="shrink-0 grid place-items-center h-8 w-8 rounded-lg bg-gradient-brand text-white shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="发送"
                >
                  {isStreaming ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="mt-1.5 text-[10px] text-muted/60 text-center">
                AI 回答仅供参考，可能存在偏差 · Enter 发送 / Shift+Enter 换行
              </div>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
