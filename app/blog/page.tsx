import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts, getAllCategories } from "@/lib/mdx";
import { getViewsBatch } from "@/lib/views";
import { siteConfig } from "@/lib/site-config";

// 老王说明：文章列表页
// 当前版本：直接列出所有文章 + 分类筛选 chip（点击跳转分类页，下个迭代实现）
//
// ISR：每 60 秒在后台重新生成一次，让浏览量数据不至于一直停在构建时
// 用户访问永远拿缓存（毫秒级），后台静默刷新，体验/数据兼顾
export const revalidate = 60;

export const metadata: Metadata = {
  title: "博客",
  description: "工业互联网、AI 应用、全栈工程实践笔记。",
};

// 老王说明：博客列表页 BreadcrumbList - 让 Google SERP 显示「首页 › 博客」路径
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "首页",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "博客",
      item: `${siteConfig.url}/blog`,
    },
  ],
};

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  // 老王说明：一次 mget 把全部文章的浏览量拿到，避免 N 次请求
  const viewsMap = await getViewsBatch(posts.map((p) => p.slug));

  return (
    <Container size="wide" className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* 标题区 */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient-brand">博客</span>
        </h1>
        <p className="mt-3 text-muted max-w-2xl">
          工业互联网实战、AI 应用探索、全栈工程经验，老王边写代码边记录。
        </p>
      </header>

      {/* 分类 chip */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-white">
            全部 · {posts.length}
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs text-muted hover:border-brand/60 hover:text-brand transition-colors cursor-pointer"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">还没有文章哦，老王正在码字…</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              views={viewsMap[post.slug]}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
