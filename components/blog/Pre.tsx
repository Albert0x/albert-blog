"use client";

import { useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// 老王说明：代码块包装器 - 给 rehype-pretty-code 生成的 <pre> 加复制按钮
// - 用 ref 直接读 DOM 里的纯文本（绕过 Shiki 的 token 嵌套结构）
// - 按钮默认半透明，hover 整个代码块时变高亮
// - 复制成功 → 按钮变 ✓ 2 秒后恢复
export function Pre(props: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const code = preRef.current?.querySelector("code")?.innerText;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 老王说明：HTTP 环境下 clipboard API 不可用，悄悄失败即可
    }
  };

  return (
    <div className="relative group/code">
      <pre ref={preRef} {...props} />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "已复制" : "复制代码"}
        title={copied ? "已复制" : "复制"}
        className={cn(
          "absolute top-2 right-2 z-10",
          "inline-flex items-center justify-center h-7 w-7 rounded-md",
          "bg-card/80 border border-border/60 backdrop-blur-sm",
          "text-muted hover:text-foreground",
          "opacity-0 group-hover/code:opacity-100 transition-opacity",
          copied && "!opacity-100 text-emerald-500 border-emerald-500/40"
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
