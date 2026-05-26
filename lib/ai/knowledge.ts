import MiniSearch from "minisearch";
import { getAllPosts, type PostMeta } from "@/lib/mdx";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// 老王说明：博客知识库 - 把所有 MDX 文章切片 + 建索引，供 AI 助手检索
// 策略：
//  - 用 MiniSearch（轻量级全文检索，BM25 排序），无需向量 API，0 成本
//  - 单例 + 懒加载：服务端首次调用时构建索引，后续请求共享
//  - 切片大小 ~500 字符，按段落边界尽量保留语义完整

// 知识库单个切片
export interface KnowledgeChunk {
  id: string;
  postSlug: string;
  postTitle: string;
  postCategory: string;
  content: string;
  // 在文章中的序号（第几片）
  order: number;
}

// 检索结果（带相关度分数）
export interface KnowledgeSearchResult extends KnowledgeChunk {
  score: number;
}

// 老王说明：服务端模块级单例，避免每次请求都重建索引
let cachedIndex: MiniSearch<KnowledgeChunk> | null = null;
let cachedChunks: Map<string, KnowledgeChunk> | null = null;

// 老王说明：把一段长文切成多个 chunk（按段落 / 句号 / 空行边界，避免硬切）
function chunkText(text: string, maxChars = 500): string[] {
  // 去掉 frontmatter 残余和过多空行
  const cleaned = text.replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned.length <= maxChars) return [cleaned];

  const chunks: string[] = [];
  // 优先按段落切（双换行），其次按句号
  const paragraphs = cleaned.split(/\n\n+/);
  let buffer = "";

  for (const p of paragraphs) {
    if ((buffer + "\n\n" + p).length <= maxChars) {
      buffer = buffer ? buffer + "\n\n" + p : p;
    } else {
      if (buffer) chunks.push(buffer);
      // 单段超长 → 按句号再切
      if (p.length > maxChars) {
        const sentences = p.split(/(?<=[。！？!?])/);
        let sb = "";
        for (const s of sentences) {
          if ((sb + s).length <= maxChars) sb += s;
          else {
            if (sb) chunks.push(sb);
            sb = s;
          }
        }
        if (sb) chunks.push(sb);
        buffer = "";
      } else {
        buffer = p;
      }
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

// 老王说明：读取 MDX 正文（getAllPosts 只返回 meta，不含正文，这里直接读文件）
function readPostContent(slug: string): string | null {
  const dir = path.join(process.cwd(), "content", "posts");
  for (const ext of ["mdx", "md"]) {
    const fp = path.join(dir, `${slug}.${ext}`);
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, "utf8");
      const { content } = matter(raw);
      return content;
    }
  }
  return null;
}

// 老王说明：构建知识库（懒加载 + 单例）
function buildIndex(): {
  index: MiniSearch<KnowledgeChunk>;
  chunks: Map<string, KnowledgeChunk>;
} {
  if (cachedIndex && cachedChunks) {
    return { index: cachedIndex, chunks: cachedChunks };
  }

  const posts = getAllPosts();
  const chunksList: KnowledgeChunk[] = [];

  for (const post of posts) {
    const content = readPostContent(post.slug);
    if (!content) continue;

    const slices = chunkText(content);
    slices.forEach((slice, i) => {
      chunksList.push({
        id: `${post.slug}::${i}`,
        postSlug: post.slug,
        postTitle: post.title,
        postCategory: post.category,
        content: slice,
        order: i,
      });
    });
  }

  // 同时把项目数据也喂进去（让 AI 能回答项目相关问题）
  // 老王说明：项目数据不需要切片（每个项目本身就是一段简短描述）
  // 留到下一版补充，避免一次改动过多

  const index = new MiniSearch<KnowledgeChunk>({
    idField: "id",
    fields: ["content", "postTitle", "postCategory"],
    storeFields: [
      "postSlug",
      "postTitle",
      "postCategory",
      "content",
      "order",
    ],
    searchOptions: {
      boost: { postTitle: 2, postCategory: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    },
    // 老王说明：中文分词 - 简单按字符切，比 MiniSearch 默认的空格切更适合中文
    tokenize: (text) => {
      const tokens: string[] = [];
      // 英文 / 数字按单词切
      const enParts = text.match(/[A-Za-z0-9]+/g) || [];
      tokens.push(...enParts);
      // 中文按 2-gram 切（每相邻两字一组）
      // 用反向匹配「只保留 CJK 汉字」，避免 \p{P} 需要 ES2018+ target 的兼容性问题
      // 一-鿿 是 CJK 统一表意文字基础区间，覆盖绝大多数中文汉字
      const cnText = text.replace(/[^一-鿿]+/g, "");
      for (let i = 0; i < cnText.length - 1; i++) {
        tokens.push(cnText.slice(i, i + 2));
      }
      // 单字也保留（提升召回）
      tokens.push(...cnText.split(""));
      return tokens;
    },
  });

  index.addAll(chunksList);

  const chunksMap = new Map(chunksList.map((c) => [c.id, c]));
  cachedIndex = index;
  cachedChunks = chunksMap;

  return { index, chunks: chunksMap };
}

// 老王说明：搜索 API - 给 /api/chat 用
export function searchKnowledge(
  query: string,
  topK = 3
): KnowledgeSearchResult[] {
  const { index, chunks } = buildIndex();
  const results = index.search(query, { combineWith: "OR" });

  return results.slice(0, topK).map((r) => {
    const chunk = chunks.get(r.id as string);
    return {
      ...(chunk as KnowledgeChunk),
      score: r.score,
    };
  });
}

// 老王说明：辅助 - 获取文章列表（用于 AI 系统提示词里的概览）
export function getKnowledgeOverview(): {
  totalPosts: number;
  posts: Pick<PostMeta, "title" | "category" | "description">[];
} {
  const posts = getAllPosts();
  return {
    totalPosts: posts.length,
    posts: posts.map((p) => ({
      title: p.title,
      category: p.category,
      description: p.description,
    })),
  };
}
