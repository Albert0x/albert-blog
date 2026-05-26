import Link from "next/link";
import { FileText, Plus, AlertCircle, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { listPosts, slugFromPath } from "@/lib/github";
import { getAllPosts } from "@/lib/mdx";

// 老王说明：后台首页 - 文章管理列表
// - 从 GitHub API 拿实时列表（保证看到的是仓库最新状态）
// - 同时本地 getAllPosts 拿到 frontmatter 元信息（拼合展示）
// - 已发布的文章和 GitHub 上的文件做关联匹配
export const dynamic = "force-dynamic"; // 不缓存，每次进后台都拉新

export default async function AdminHomePage() {
  const session = await auth();
  const token = (session as { accessToken?: string })?.accessToken;

  if (!token) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
        <div>
          <h2 className="font-semibold text-rose-500">缺少 GitHub Token</h2>
          <p className="text-sm text-muted mt-1">
            重新登录一次让 GitHub 授权颁发 token。
          </p>
        </div>
      </div>
    );
  }

  const [ghFiles, localPosts] = await Promise.all([
    listPosts(token),
    Promise.resolve(getAllPosts()),
  ]);

  // 用 slug 把 GitHub 文件和本地 frontmatter 拼起来
  const localMap = new Map(localPosts.map((p) => [p.slug, p]));
  const rows = ghFiles
    .map((f) => {
      const slug = slugFromPath(f.path);
      const meta = localMap.get(slug);
      return {
        slug,
        path: f.path,
        sha: f.sha,
        title: meta?.title ?? slug,
        description: meta?.description ?? "",
        category: meta?.category ?? "未分类",
        date: meta?.date ?? "",
        size: f.size,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      {/* 标题区 */}
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            文章 <span className="text-gradient-brand">管理</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            共 {rows.length} 篇文章 · 改动会通过 GitHub commit 直接发布到 main 分支
          </p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          新建文章
        </Link>
      </header>

      {/* 文章列表 */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted/50 mb-3" />
          <p className="text-muted">还没有文章，写第一篇吧</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            创建文章
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <Link
              key={r.slug}
              href={`/admin/edit/${r.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:border-brand/40 hover:bg-gradient-brand-soft p-4 transition-all"
            >
              {/* 分类色块 */}
              <div className="h-12 w-1 rounded-full bg-gradient-brand shrink-0" />

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] inline-flex items-center rounded-full bg-gradient-brand-soft px-2 py-0.5 text-brand">
                    {r.category}
                  </span>
                  <span className="text-xs text-muted">{r.date}</span>
                </div>
                <h3 className="font-semibold truncate group-hover:text-brand transition-colors">
                  {r.title}
                </h3>
                {r.description && (
                  <p className="text-xs text-muted truncate mt-0.5">
                    {r.description}
                  </p>
                )}
              </div>

              {/* 文件大小 */}
              <div className="hidden sm:flex flex-col items-end text-[10px] text-muted shrink-0">
                <span>{(r.size / 1024).toFixed(1)} KB</span>
                <span className="opacity-50">{r.slug}.mdx</span>
              </div>

              {/* 在线访问 */}
              <a
                href={`/blog/${r.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="grid place-items-center h-8 w-8 rounded-md text-muted hover:text-brand hover:bg-foreground/5 transition-colors shrink-0"
                aria-label="查看线上"
                title="查看线上"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
