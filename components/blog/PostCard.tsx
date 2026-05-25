import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { PostMeta } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";

// 老王说明：文章列表卡片
// - 渐变描边：hover 时显示彩色边框
// - 分类彩色 chip
export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-hover group block rounded-2xl border border-border/60 bg-card p-6 relative overflow-hidden"
    >
      {/* 渐变光晕装饰 */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-brand opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500" />

      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-full bg-gradient-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">
          {post.category}
        </span>
      </div>

      <h3 className="text-xl font-semibold leading-snug mb-2 group-hover:text-gradient-brand transition-colors">
        {post.title}
      </h3>

      {post.description && (
        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
          {post.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(post.date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readingMinutes} 分钟阅读
        </span>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-muted border border-border/60 rounded px-1.5 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
