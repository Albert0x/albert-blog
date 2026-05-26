import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";

// 老王说明：文章级动态 OG 卡片
// - 每篇文章自动生成独有的分享卡片：标题 + 分类 + 副标题
// - generateStaticParams 让所有文章在构建期生成静态图，运行时 0 计算开销
// - 不指定 runtime（默认 Node.js）- 因为 getPostBySlug 内部用了 reading-time 包依赖 Node.js stream
export const contentType = "image/png";
export const size = OG_SIZE;
export const alt = "文章分享卡";

// 老王说明：构建期预生成每篇文章的 OG 图，与 page.tsx 的 generateStaticParams 对齐
// 不用 generateImageMetadata（那是给单篇生成多图用的，我们只需要一张）
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogOpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return new ImageResponse(<OgTemplate title="文章不存在" />, { ...size });
  }

  return new ImageResponse(
    (
      <OgTemplate
        badge={post.category}
        title={post.title}
        subtitle={post.description}
      />
    ),
    { ...size }
  );
}
