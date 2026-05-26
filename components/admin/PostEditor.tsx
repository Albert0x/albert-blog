"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Save, Trash2, ArrowLeft, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

// 老王说明：Monaco Editor 动态加载（不要 SSR，否则编辑器庞大的 JS 会拖慢首屏）
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="h-full w-full grid place-items-center bg-card border border-border/60 rounded-xl">
      <div className="text-sm text-muted flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        加载编辑器...
      </div>
    </div>
  );
}

// frontmatter 表单字段
interface Frontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string;
  draft: boolean;
}

interface PostEditorProps {
  /** 现有文章 slug（编辑模式有，新建模式没有）*/
  slug?: string;
  /** 现有正文（不含 frontmatter） */
  initialBody?: string;
  /** 现有 frontmatter */
  initialFrontmatter?: Partial<Frontmatter>;
  /** GitHub 文件的 sha（更新时必传） */
  sha?: string;
}

// 老王说明：组装 frontmatter + body 成完整 mdx 文件内容
function buildMdx(fm: Frontmatter, body: string): string {
  const tags = fm.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `"${t}"`)
    .join(", ");

  const lines = [
    "---",
    `title: "${fm.title.replace(/"/g, '\\"')}"`,
    `description: "${fm.description.replace(/"/g, '\\"')}"`,
    `date: "${fm.date}"`,
    `category: "${fm.category}"`,
    `tags: [${tags}]`,
  ];
  if (fm.draft) lines.push(`draft: true`);
  lines.push("---", "", body);
  return lines.join("\n");
}

// 老王说明：把 title 转成 url-friendly slug（仅新建模式自动生成）
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "untitled";
}

const CATEGORIES = [
  "工业互联网",
  "AI 应用",
  "全栈工程",
  "小程序",
  "随笔",
  "其他",
];

export function PostEditor({
  slug: existingSlug,
  initialBody = "",
  initialFrontmatter = {},
  sha,
}: PostEditorProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isEdit = Boolean(existingSlug);

  const [fm, setFm] = useState<Frontmatter>({
    title: initialFrontmatter.title ?? "",
    description: initialFrontmatter.description ?? "",
    date:
      initialFrontmatter.date ??
      new Date().toISOString().slice(0, 10),
    category: initialFrontmatter.category ?? CATEGORIES[0],
    tags: Array.isArray(initialFrontmatter.tags)
      ? (initialFrontmatter.tags as unknown as string[]).join(", ")
      : (initialFrontmatter.tags as string) ?? "",
    draft: Boolean(initialFrontmatter.draft),
  });
  const [body, setBody] = useState(initialBody);
  const [slug, setSlug] = useState(existingSlug ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // 老王说明：新建时自动从 title 生成 slug
  useEffect(() => {
    if (!isEdit) setSlug(generateSlug(fm.title));
  }, [fm.title, isEdit]);

  const handleSave = async () => {
    setError(null);
    setInfo(null);
    if (!fm.title.trim()) {
      setError("标题不能为空");
      return;
    }
    if (!slug.trim()) {
      setError("slug 不能为空");
      return;
    }
    if (!body.trim()) {
      setError("正文不能为空");
      return;
    }

    setSaving(true);
    const mdx = buildMdx(fm, body);

    try {
      const url = isEdit
        ? `/api/admin/posts/${existingSlug}`
        : "/api/admin/posts";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: mdx, sha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? `保存失败 (${res.status})`);
        return;
      }
      setInfo(
        isEdit
          ? "更新成功！Vercel 正在重新部署，1-2 分钟后线上生效。"
          : "创建成功！Vercel 正在部署。"
      );
      // 新建后跳转到编辑页
      if (!isEdit) {
        setTimeout(() => router.push(`/admin/edit/${slug}`), 1000);
      } else {
        setTimeout(() => router.refresh(), 1500);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !sha) return;
    if (!confirm(`确定删除「${fm.title}」？此操作会立即推送删除 commit 到 GitHub，不可撤销。`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${existingSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? `删除失败 (${res.status})`);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          {isEdit && existingSlug && (
            <a
              href={`/blog/${existingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-muted hover:text-brand transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              查看线上
            </a>
          )}
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
            >
              {deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              删除
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-brand px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEdit ? "更新发布" : "创建并发布"}
          </button>
        </div>
      </div>

      {/* 错误 / 成功提示 */}
      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2 text-sm text-rose-500">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
          ✅ {info}
        </div>
      )}

      {/* Frontmatter 表单 */}
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-muted">标题 *</label>
          <input
            type="text"
            value={fm.title}
            onChange={(e) => setFm({ ...fm, title: e.target.value })}
            placeholder="文章标题"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-brand"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs text-muted">摘要</label>
          <input
            type="text"
            value={fm.description}
            onChange={(e) => setFm({ ...fm, description: e.target.value })}
            placeholder="一句话描述（用于卡片 + OG + SEO）"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs text-muted">Slug *（URL 路径）</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isEdit}
            placeholder="my-first-post"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-mono placeholder:text-muted/60 focus:outline-none focus:border-brand disabled:opacity-60"
          />
          {!isEdit && (
            <p className="mt-1 text-[10px] text-muted/70">
              文件将创建为 content/posts/{slug || "[slug]"}.mdx
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted">日期</label>
          <input
            type="date"
            value={fm.date}
            onChange={(e) => setFm({ ...fm, date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs text-muted">分类</label>
          <select
            value={fm.category}
            onChange={(e) => setFm({ ...fm, category: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:border-brand"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted">标签（逗号分隔）</label>
          <input
            type="text"
            value={fm.tags}
            onChange={(e) => setFm({ ...fm, tags: e.target.value })}
            placeholder="React, Python, AI"
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-brand"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={fm.draft}
              onChange={(e) => setFm({ ...fm, draft: e.target.checked })}
              className="accent-brand"
            />
            标记为草稿（不会出现在文章列表）
          </label>
        </div>
      </div>

      {/* Monaco 编辑器 */}
      <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-border/60">
        <MonacoEditor
          height="100%"
          defaultLanguage="markdown"
          language="markdown"
          theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
          value={body}
          onChange={(v) => setBody(v ?? "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            fontFamily: "var(--font-geist-mono), monospace",
            tabSize: 2,
          }}
        />
      </div>

      <p className="mt-2 text-[10px] text-muted/60 text-center">
        支持 MDX 语法（Markdown + JSX）· 改动会作为 commit 推送到 GitHub main 分支
      </p>
    </div>
  );
}
