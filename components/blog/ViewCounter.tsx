"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

// 老王说明：浏览量组件
// - 客户端 mount 后调 POST 上报（Redis 端 24h 同 IP 去重）
// - 然后实时显示返回的最新计数
// - 配合 SSR 初始值（initialCount）避免 hydration 闪烁
// - Upstash 未配置时（如本地无 .env）静默不显示
interface Props {
  slug: string;
  /** SSR 拿到的初始浏览量，避免闪烁 */
  initialCount?: number;
}

export function ViewCounter({ slug, initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    // 老王说明：mount 后上报浏览，Redis 端会自动去重
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/views/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (res.status === 503) setConfigured(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (typeof data.count === "number") setCount(data.count);
      } catch (err) {
        console.error("[views] report failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 未配置时不展示（不占位）
  if (!configured && count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5" title="浏览次数（24 小时内同人只计一次）">
      <Eye className="h-4 w-4" />
      {count.toLocaleString()} 次阅读
    </span>
  );
}
