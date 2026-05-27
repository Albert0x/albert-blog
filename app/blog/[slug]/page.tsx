import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MessageSquare } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Avatar } from "@/components/ui/Avatar";
import { MdxContent } from "@/components/blog/MdxContent";
import { LikeButton } from "@/components/blog/LikeButton";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { PostNavigation } from "@/components/blog/PostNavigation";
import { GiscusComments } from "@/components/comments/Giscus";
import { extractToc } from "@/lib/toc";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";

// 老王说明：构建期生成所有文章静态路由
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// 老王说明：动态生成每篇文章的 SEO 元信息
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "文章不存在" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  // 老王说明：从 MDX 正文提取 TOC（h2 / h3），传给侧边栏组件
  const toc = extractToc(post.content);

  // 老王说明：找出上一篇 / 下一篇（按日期降序，前一项=更新，后一项=更旧）
  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx < allPosts.length - 1 && idx !== -1 ? allPosts[idx + 1] : null;

  // 老王说明：文章级 JSON-LD（Article schema）- 帮搜索引擎生成富媒体卡片
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${baseUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: siteConfig.author.name,
      url: baseUrl,
    },
    publisher: { "@id": `${baseUrl}/#person` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/blog/${post.slug}` },
    image: `${baseUrl}/blog/${post.slug}/opengraph-image`,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    inLanguage: "zh-CN",
  };

  return (
    <article className="py-12 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* 老王说明：TOC 自己 fixed 定位，不影响主流布局 */}
      <TableOfContents items={toc} />

      <Container size="narrow">
        {/* 返回链接 */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          返回文章列表
        </Link>

        {/* 文章头部 */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-gradient-brand-soft px-3 py-1 text-xs font-medium text-brand">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance leading-[1.15] mb-4">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-lg text-muted text-balance mb-6">
              {post.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted border-t border-border/60 pt-5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingMinutes} 分钟阅读
            </span>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs border border-border/60 rounded px-2 py-0.5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 正文（typography 排版） */}
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-code:text-brand prose-code:before:content-none prose-code:after:content-none">
          <MdxContent source={post.content} />
        </div>

        {/* 老王说明：点赞按钮 - 匿名访客也能点，Cookie 永久去重 */}
        <div className="mt-16 flex justify-center">
          <LikeButton slug={post.slug} />
        </div>

        {/* 底部分割 + 返回 + 作者签名 */}
        <div className="mt-12 pt-8 border-t border-border/60 flex justify-between items-center gap-4 flex-wrap">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            更多文章
          </Link>
          {/* 老王说明：作者签名加头像，提升个人品牌识别度 */}
          <Link
            href="/about"
            className="inline-flex items-center gap-2.5 text-xs text-muted hover:text-brand transition-colors group"
          >
            <Avatar size="sm" className="group-hover:ring-2 ring-brand/40 transition-all" />
            <span className="flex flex-col items-end">
              <span className="text-foreground/80 font-medium">{siteConfig.author.name}</span>
              <span className="text-[10px]">{siteConfig.author.role.split(" / ")[0]}</span>
            </span>
          </Link>
        </div>

        {/* 老王说明：上一篇 / 下一篇导航 */}
        <PostNavigation prev={prev} next={next} />

        {/* 老王说明：Giscus 评论区，基于 GitHub Discussions，每篇文章按 pathname 自动创建独立 Issue */}
        <section className="mt-16 pt-8 border-t border-border/60">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">评论 & 讨论</h2>
            <span className="text-xs text-muted">· 由 GitHub Discussions 驱动</span>
          </div>
          <GiscusComments />
        </section>
      </Container>
    </article>
  );
}
