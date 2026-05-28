"use client";

// 老王说明：error.tsx 必须是 Client Component（Next.js 要求）
// 捕获子树里的运行时报错，展示友好界面代替白屏
import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里接入 Sentry 上报：Sentry.captureException(error)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <Container size="narrow" className="py-32 flex flex-col items-center text-center">
      {/* 错误图标 */}
      <div className="mb-8 grid h-24 w-24 place-items-center rounded-full border border-red-500/20 bg-red-500/5">
        <span className="text-4xl select-none">💥</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
        出了点<span className="text-red-500"> 问题</span>
      </h1>
      <p className="text-muted max-w-sm mb-3">
        页面遇到了未知错误。老王已经知道了，但你也可以先刷新试试。
      </p>

      {/* 错误 digest（方便排查，不泄露堆栈） */}
      {error.digest && (
        <p className="mb-8 text-xs text-muted/50 font-mono">
          错误 ID: {error.digest}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          重试一次
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-6 py-3 text-sm font-medium hover:border-brand/60 hover:text-brand backdrop-blur-md transition-all"
        >
          <Home className="h-4 w-4" />
          回首页
        </Link>
      </div>
    </Container>
  );
}
