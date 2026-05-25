import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

// 老王说明：文章元信息（frontmatter 字段）
export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;           // ISO 8601 格式：2026-05-22
  category: string;       // 工业互联网 / AI 应用 / 全栈工程
  tags: string[];
  cover?: string;         // 封面图（可选）
  draft?: boolean;        // 草稿不会被列出
}

// 列表项（带 slug 和阅读时间，不含正文，给列表页用）
export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: string;    // 例如 "5 min read"
  readingMinutes: number;
}

// 单篇文章（含正文）
export interface Post extends PostMeta {
  content: string;
}

// 内容目录
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// 老王说明：读取所有非草稿文章，按日期降序排序
export function getAllPosts(): PostMeta[] {
  // 目录不存在直接返回空，避免崩
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const rt = readingTime(content);
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        date: data.date ?? "1970-01-01",
        category: data.category ?? "未分类",
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover,
        draft: Boolean(data.draft),
        readingTime: rt.text,
        readingMinutes: Math.ceil(rt.minutes),
      } satisfies PostMeta;
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

// 老王说明：按 slug 读取单篇文章正文，找不到返回 null
export function getPostBySlug(slug: string): Post | null {
  const filePath = ["mdx", "md"]
    .map((ext) => path.join(POSTS_DIR, `${slug}.${ext}`))
    .find((p) => fs.existsSync(p));

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    category: data.category ?? "未分类",
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover,
    draft: Boolean(data.draft),
    readingTime: rt.text,
    readingMinutes: Math.ceil(rt.minutes),
    content,
  };
}

// 取所有分类（用于侧边栏/筛选器）
export function getAllCategories(): string[] {
  const set = new Set(getAllPosts().map((p) => p.category));
  return Array.from(set).sort();
}

// 取所有标签
export function getAllTags(): string[] {
  const set = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
