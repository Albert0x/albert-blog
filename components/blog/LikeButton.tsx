"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// 老王说明：匿名点赞按钮
// - 数据走 /api/likes/[slug]，无需登录
// - 乐观更新：点击瞬间数字 +1，失败时回滚
// - Cookie 去重，每浏览器每篇 1 次
// - KV 未配置时自动隐藏（不破坏页面布局）
// - 漂浮 ❤️ 粒子动画，点一次飘 3 个
interface LikeButtonProps {
  slug: string;
}

interface LikeStatus {
  count: number;
  voted: boolean;
  configured: boolean;
}

// 飘心粒子（用随机偏移做散布效果）
interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
}

export function LikeButton({ slug }: LikeButtonProps) {
  const [status, setStatus] = useState<LikeStatus>({
    count: 0,
    voted: false,
    configured: true,
  });
  const [loading, setLoading] = useState(false);
  const [floats, setFloats] = useState<FloatingHeart[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 老王说明：首次挂载从服务端拉真实数据（避免每次 build 都要重新静态化）
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/likes/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setStatus({
          count: data.count ?? 0,
          voted: data.voted ?? false,
          configured: data.configured ?? true,
        });
      })
      .catch(() => {
        // 静默失败，按钮就不出现
        if (!cancelled) {
          setStatus((s) => ({ ...s, configured: false }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const triggerFloat = () => {
    // 生成 3 个偏移随机的飘心
    const ts = Date.now();
    const newFloats: FloatingHeart[] = Array.from({ length: 3 }, (_, i) => ({
      id: ts + i,
      x: (Math.random() - 0.5) * 50, // -25 ~ 25 px 横向偏移
      delay: i * 0.1,
    }));
    setFloats((prev) => [...prev, ...newFloats]);
    // 1.2s 后清理
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => !newFloats.some((nf) => nf.id === f.id)));
    }, 1500);
  };

  const handleLike = async () => {
    if (status.voted || loading) return;
    setLoading(true);
    setError(null);
    // 乐观更新
    setStatus((s) => ({ ...s, count: s.count + 1, voted: true }));
    triggerFloat();

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        // 回滚乐观更新
        setStatus((s) => ({ ...s, count: s.count - 1, voted: false }));
        setError(data.message || "点赞失败，请稍后重试");
        return;
      }
      // 同步服务端真实值
      setStatus({
        count: data.count,
        voted: true,
        configured: true,
      });
    } catch {
      setStatus((s) => ({ ...s, count: s.count - 1, voted: false }));
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 未配置 KV 时直接不渲染
  if (!status.configured) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 按钮主体 */}
      <div className="relative">
        <motion.button
          type="button"
          onClick={handleLike}
          disabled={status.voted || loading}
          whileTap={status.voted ? undefined : { scale: 0.88 }}
          whileHover={status.voted ? undefined : { scale: 1.08 }}
          className={cn(
            "relative grid h-16 w-16 place-items-center rounded-full border-2 transition-all overflow-visible",
            status.voted
              ? "border-rose-500 bg-rose-500/10 cursor-default shadow-lg shadow-rose-500/20"
              : "border-border/60 bg-card hover:border-rose-500/60 hover:bg-rose-500/5 cursor-pointer"
          )}
          aria-label={status.voted ? "已点赞" : "为这篇文章点赞"}
          aria-pressed={status.voted}
        >
          <Heart
            className={cn(
              "h-7 w-7 transition-all",
              status.voted
                ? "fill-rose-500 text-rose-500"
                : "text-muted group-hover:text-rose-500"
            )}
          />

          {/* 飘心粒子 */}
          <AnimatePresence>
            {floats.map((f) => (
              <motion.span
                key={f.id}
                initial={{ y: 0, x: f.x, opacity: 1, scale: 0.6 }}
                animate={{ y: -60, opacity: 0, scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, delay: f.delay, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg pointer-events-none"
                aria-hidden
              >
                ❤️
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* 数字（带动画切换） */}
      <div className="text-base font-semibold tabular-nums leading-none h-5">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={status.count}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            {status.count}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 文案 */}
      <div className="text-xs text-muted text-center min-h-[1rem]">
        {error ? (
          <span className="text-rose-500">{error}</span>
        ) : status.voted ? (
          "感谢你的喜欢 💖"
        ) : (
          "喜欢这篇文章？"
        )}
      </div>
    </div>
  );
}
