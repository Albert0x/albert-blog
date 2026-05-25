"use client";

import Giscus from "@giscus/react";
import { siteConfig } from "@/lib/site-config";

// 老王说明：Giscus 评论组件
// 用法：
//   <GiscusComments /> - 默认按 pathname 映射，每篇文章独立评论
//   <GiscusComments mapping="specific" term="guestbook" /> - 留言板模式
//
// 主题跟随系统明暗模式（preferred_color_scheme），未来加暗色切换器后可改成受控
interface GiscusCommentsProps {
  /** 映射模式覆盖（默认用 siteConfig.giscus.mapping） */
  mapping?: "pathname" | "url" | "title" | "og:title" | "specific" | "number";
  /** mapping=specific 时的关键词 */
  term?: string;
}

export function GiscusComments({ mapping, term }: GiscusCommentsProps = {}) {
  const cfg = siteConfig.giscus;

  // 老王说明：未配置时显示占位，避免控制台一堆错
  // 检查 repoId 是不是占位字符串
  if (cfg.repoId.startsWith("REPLACE_WITH")) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
        <p className="text-sm text-muted">
          💬 评论系统未配置
        </p>
        <p className="text-xs text-muted/70 mt-1">
          在{" "}
          <code className="text-brand">lib/site-config.ts</code>{" "}
          填好 Giscus 配置后即可启用。
        </p>
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs text-brand hover:underline"
        >
          前往 giscus.app 获取配置 →
        </a>
      </div>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={cfg.repo}
      repoId={cfg.repoId}
      category={cfg.category}
      categoryId={cfg.categoryId}
      mapping={mapping ?? cfg.mapping}
      term={term}
      strict="0"
      reactionsEnabled={cfg.reactionsEnabled ? "1" : "0"}
      emitMetadata="0"
      inputPosition={cfg.inputPosition}
      theme="preferred_color_scheme"
      lang={cfg.lang}
      loading="lazy"
    />
  );
}
