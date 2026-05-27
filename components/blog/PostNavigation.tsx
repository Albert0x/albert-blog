import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/mdx";

// 老王说明：文章详情页底部「上一篇 / 下一篇」导航
// - prev = 列表里的前一项（按日期降序，更新的文章）
// - next = 列表里的后一项（更早的文章）
// - 任一为 null 时该侧不显示，另一侧 ml-auto 靠边
interface PostNavigationProps {
  prev?: PostMeta | null;
  next?: PostMeta | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-3 sm:grid-cols-2 not-prose" aria-label="文章导航">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-2xl border border-border/60 bg-card hover:border-brand/50 hover:bg-gradient-brand-soft p-4 transition-all"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            上一篇
          </span>
          <span className="font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col gap-1 sm:text-right rounded-2xl border border-border/60 bg-card hover:border-brand/50 hover:bg-gradient-brand-soft p-4 transition-all"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted inline-flex items-center gap-1 sm:justify-end">
            下一篇
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="font-medium text-sm line-clamp-2 group-hover:text-brand transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
