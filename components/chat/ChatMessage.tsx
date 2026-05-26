"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, FileText, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

// 老王说明：单条消息组件 - 区分用户消息 / AI 消息
// AI 消息支持 Markdown 渲染 + 引用文章卡片
interface SourceItem {
  slug: string;
  title: string;
  category: string;
}

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  /** 文本内容（用户消息 = 字符串，AI 消息 = 从 parts 提取的拼接文本）*/
  content: string;
  /** AI 引用的相关文章 */
  sources?: SourceItem[];
  /** 是否正在流式生成（最后一条 AI 消息）*/
  streaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  sources,
  streaming,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 / Bot 图标 */}
      <div className="shrink-0">
        {isUser ? (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground/10 text-foreground/70">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white shadow-md shadow-brand/30">
            <Bot className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* 消息体 */}
      <div
        className={cn(
          // 老王说明：用户消息 80%（短而紧凑），AI 消息 92%（更宽容纳代码 / 表格）
          "flex flex-col gap-2 min-w-0",
          isUser ? "items-end max-w-[80%]" : "items-start max-w-[92%] flex-1"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed min-w-0 max-w-full overflow-hidden",
            isUser
              ? "bg-gradient-brand text-white shadow-md shadow-brand/20 rounded-tr-sm"
              : "bg-card border border-border/60 rounded-tl-sm w-full"
          )}
        >
          {isUser ? (
            // 用户消息：纯文本（保留换行 + 长串可断行）
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            // AI 消息：Markdown 渲染
            // 老王说明：prose-pre 加横向滚动 + max-w-full 避免长代码撑爆面板
            <div
              className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "prose-p:my-1.5 prose-headings:my-2",
                "prose-pre:my-2 prose-pre:text-xs prose-pre:max-w-full prose-pre:overflow-x-auto",
                "prose-code:text-xs prose-code:break-all",
                "break-words"
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || (streaming ? "▎" : "")}
              </ReactMarkdown>
              {streaming && content && (
                <span className="inline-block w-1.5 h-3.5 bg-brand animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* AI 引用的相关文章 */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sources.map((s) => (
              <Link
                key={s.slug}
                href={`/blog/${s.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card hover:border-brand/60 hover:bg-gradient-brand-soft px-2.5 py-1 text-[10px] text-muted hover:text-brand transition-all"
              >
                <FileText className="h-3 w-3" />
                <span className="font-medium truncate max-w-[200px]">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 老王说明：欢迎语 / 空状态组件
export function ChatWelcome({
  onPickSuggestion,
}: {
  onPickSuggestion: (text: string) => void;
}) {
  const suggestions = [
    "你做过哪些工业互联网项目？",
    "聊聊你在 RAG 上的实践经验",
    "你的全栈技术栈是什么？",
  ];

  return (
    <div className="flex flex-col items-center text-center py-8 px-6">
      <div className="relative mb-4">
        <Avatar size="lg" ring />
        <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-brand text-white shadow-md ring-2 ring-background">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">
        嗨，我是 <span className="text-gradient-brand">{siteConfig.name}</span> 的 AI 助手
      </h3>
      <p className="text-xs text-muted mb-6 max-w-xs">
        基于博客文章训练，可以聊聊工业互联网、AI 应用、全栈工程等话题
      </p>

      <div className="w-full space-y-2">
        <div className="text-[10px] text-muted uppercase tracking-wider mb-2">
          试试问：
        </div>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPickSuggestion(s)}
            className="block w-full text-left rounded-xl border border-border/60 bg-card hover:border-brand/40 hover:bg-gradient-brand-soft px-3 py-2 text-xs text-muted hover:text-foreground transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
