"use client";

import { useDeferredValue, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, FileEdit } from "lucide-react";

// 老王说明：编辑器实时预览面板
// - 复用项目已有依赖 react-markdown + remark-gfm（已在 chat 组件里用过，DRY）
// - useDeferredValue 让长文章输入时不卡顿（React 18 并发特性）
// - 不能 100% 还原线上效果（线上用 next-mdx-remote + shiki 高亮），但能看清 95% 视觉
// - 排版样式复用全站的 prose（@tailwindcss/typography），跟线上一致

interface PreviewFrontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string;
  draft: boolean;
}

interface Props {
  body: string;
  frontmatter: PreviewFrontmatter;
}

// 老王说明：粗略估算阅读时长（中文 300 字/分钟 + 英文 200 词/分钟）
function estimateReadingMinutes(text: string): number {
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const minutes = chineseChars / 300 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}

export function PostPreview({ body, frontmatter }: Props) {
  // 老王说明：useDeferredValue 让大文章实时输入不卡——React 会智能延后预览渲染
  const deferredBody = useDeferredValue(body);
  const isStale = body !== deferredBody;

  const readingMinutes = useMemo(
    () => estimateReadingMinutes(deferredBody),
    [deferredBody]
  );

  const tagList = useMemo(
    () =>
      frontmatter.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [frontmatter.tags]
  );

  return (
    <div
      className={`h-full overflow-auto rounded-xl border border-border/60 bg-card transition-opacity ${
        isStale ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        {/* 草稿提示横幅 */}
        {frontmatter.draft && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <FileEdit className="h-3 w-3" />
            草稿模式（不会出现在公开列表）
          </div>
        )}

        {/* 文章头部 - 模拟线上 /blog/[slug] 的展示 */}
        <header className="mb-8">
          {frontmatter.category && (
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full bg-gradient-brand-soft px-3 py-1 text-xs font-medium text-brand">
                {frontmatter.category}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-3">
            {frontmatter.title || (
              <span className="text-muted/40">未填写标题</span>
            )}
          </h1>

          {frontmatter.description && (
            <p className="text-base text-muted mb-5 leading-relaxed">
              {frontmatter.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted border-t border-border/60 pt-4">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {frontmatter.date || "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              约 {readingMinutes} 分钟阅读
            </span>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tagList.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] border border-border/60 rounded px-1.5 py-0.5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 正文（用 prose 复用线上样式） */}
        {deferredBody.trim() ? (
          <div
            className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:tracking-tight prose-headings:scroll-mt-24
              prose-a:text-brand prose-a:no-underline hover:prose-a:underline
              prose-code:text-brand prose-code:before:content-none prose-code:after:content-none
              prose-pre:text-xs"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {deferredBody}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-sm text-muted">
            正文区域，开始写就能看到效果...
          </div>
        )}

        {/* 老王说明：预览限制提示 */}
        <div className="mt-12 pt-4 border-t border-border/40 text-[10px] text-muted/60 leading-relaxed">
          ⚠️ 预览是简化版渲染，最终线上效果（代码高亮、MDX 组件、目录、JSON-LD）会更完整。
        </div>
      </div>
    </div>
  );
}
