import { searchKnowledge } from "@/lib/ai/knowledge";
import { getPostBySlug } from "@/lib/mdx";

// 老王说明：博客站内搜索 - 复用 AI 助手的 MiniSearch 知识库索引（DRY 原则）
// AI 那边按 chunk 切片粒度返回，搜索 UI 需要的是「文章级」结果——本层做聚合去重
//
// 设计要点：
//   - 同一文章可能多片 chunk 命中，按 postSlug 分组，保留 max score 的片
//   - 取片段内容做高亮预览（截取命中关键词附近 ±60 字）
//   - 返回最多 N 条，默认 8 条

export interface SearchHit {
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  /** 命中片段（含上下文），用于结果列表展示 */
  excerpt: string;
  /** 相关度分数 */
  score: number;
}

// 老王说明：从内容里截取命中查询关键词的片段
// 用首个查询 token 找位置，前后取 ±60 字。简单有效，不引第三方
function makeExcerpt(content: string, query: string, radius = 60): string {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";

  // 拿查询里第一个非空字符片段（中文 2-gram 或英文单词）
  const firstToken = query.trim().slice(0, 8);
  const idx = firstToken ? cleaned.indexOf(firstToken) : -1;

  // 没命中就取开头
  if (idx < 0) {
    return cleaned.length > radius * 2
      ? cleaned.slice(0, radius * 2) + "…"
      : cleaned;
  }

  const start = Math.max(0, idx - radius);
  const end = Math.min(cleaned.length, idx + firstToken.length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < cleaned.length ? "…" : "";
  return prefix + cleaned.slice(start, end) + suffix;
}

/**
 * 站内搜索 - 返回文章级聚合结果
 * @param query 查询字符串
 * @param limit 最多返回多少篇文章（默认 8）
 */
export function searchPosts(query: string, limit = 8): SearchHit[] {
  const q = query.trim();
  if (!q) return [];

  // 老王说明：先拿一批 chunk 结果（多取一些，因为同一文章可能多片）
  const raw = searchKnowledge(q, limit * 4);
  if (raw.length === 0) return [];

  // 按 postSlug 聚合，保留每篇 max score 那一片
  const bestPerPost = new Map<string, (typeof raw)[number]>();
  for (const chunk of raw) {
    const existing = bestPerPost.get(chunk.postSlug);
    if (!existing || chunk.score > existing.score) {
      bestPerPost.set(chunk.postSlug, chunk);
    }
  }

  // 排序 + 截断 + 拼装元信息
  const hits: SearchHit[] = [];
  const sorted = Array.from(bestPerPost.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  for (const chunk of sorted) {
    // 老王说明：拿文章 frontmatter（标题/分类/描述等）
    const post = getPostBySlug(chunk.postSlug);
    if (!post || post.draft) continue; // 草稿不应被搜出来

    hits.push({
      slug: post.slug,
      title: post.title,
      category: post.category,
      description: post.description,
      date: post.date,
      excerpt: makeExcerpt(chunk.content, q),
      score: chunk.score,
    });
  }

  return hits;
}
