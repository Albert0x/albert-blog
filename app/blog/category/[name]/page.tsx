import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PostCard } from "@/components/blog/PostCard";
import {
  getAllCategories,
  getPostsByCategory,
} from "@/lib/mdx";
import { getViewsBatch } from "@/lib/views";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

type Props = { params: Promise<{ name: string }> };

export async function generateStaticParams() {
  return getAllCategories().map((name) => ({ name: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const category = decodeURIComponent(name);
  return {
    title: `分类：${category}`,
    description: `${siteConfig.author.name} 博客中「${category}」分类下的所有文章。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  const categories = getAllCategories();

  if (!categories.includes(category)) notFound();

  const posts = getPostsByCategory(category);
  const viewsMap = await getViewsBatch(posts.map((p) => p.slug));

  return (
    <Container size="wide" className="py-16">
      <header className="mb-10">
        <div className="mb-4">
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-brand transition-colors"
          >
            ← 全部文章
          </Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient-brand">{category}</span>
        </h1>
        <p className="mt-3 text-muted">{posts.length} 篇文章</p>
      </header>

      {/* 分类 chip */}
      <div className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs text-muted hover:border-brand/60 hover:text-brand transition-colors"
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${encodeURIComponent(cat)}`}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs transition-colors ${
              cat === category
                ? "bg-gradient-brand font-medium text-white"
                : "border border-border/60 text-muted hover:border-brand/60 hover:text-brand"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} views={viewsMap[post.slug]} />
        ))}
      </div>
    </Container>
  );
}
