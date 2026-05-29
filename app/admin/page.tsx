import Link from "next/link";
import { FileText, Plus, AlertCircle, ExternalLink, FileEdit, Eye } from "lucide-react";
import { auth } from "@/auth";
import { listPosts, slugFromPath } from "@/lib/github";
import { getAllPosts } from "@/lib/mdx";
import { getViewsBatch } from "@/lib/views";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

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

  // 老王说明：后台要看到全部（含草稿），所以传 includeDrafts: true
  const [ghFiles, localPosts] = await Promise.all([
    listPosts(token),
    Promise.resolve(getAllPosts({ includeDrafts: true })),
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
        draft: meta?.draft ?? false,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // 老王说明：草稿数量统计，给标题区展示
  const draftCount = rows.filter((r) => r.draft).length;
  const publishedCount = rows.length - draftCount;

  // 老王说明：批量拿浏览量，让管理页能看到每篇热度
  const viewsMap = await getViewsBatch(rows.map((r) => r.slug));
  const totalViews = Object.values(viewsMap).reduce((sum, v) => sum + v, 0);

  return (
    <div>
      {/* 标题区 */}
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            文章 <span className="text-gradient-brand">管理</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            共 {rows.length} 篇 · 已发布{" "}
            <span className="text-emerald-500 font-medium">{publishedCount}</span> ·
            草稿{" "}
            <span className="text-amber-500 font-medium">{draftCount}</span> ·
            总阅读{" "}
            <span className="text-brand font-medium">
              {totalViews.toLocaleString()}
            </span>{" "}
            · 改动会通过 GitHub commit 直接发布到 main 分支
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
            // 老王说明：把外层从 <Link> 改成 <div>，避免链接嵌套链接
            // 这样 RSC 也不需要 onClick stopPropagation 这种 Client 端事件
            <div
              key={r.slug}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:border-brand/40 hover:bg-gradient-brand-soft p-4 transition-all"
            >
              {/* 分类色块（草稿用琥珀色提示） */}
              <div
                className={`h-12 w-1 rounded-full shrink-0 ${
                  r.draft ? "bg-amber-500" : "bg-gradient-brand"
                }`}
              />

              {/* 主内容（点击区） */}
              <Link
                href={`/admin/edit/${r.slug}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] inline-flex items-center rounded-full bg-gradient-brand-soft px-2 py-0.5 text-brand">
                    {r.category}
                  </span>
                  {/* 老王说明：草稿标签 - 醒目琥珀色，提醒未公开 */}
                  {r.draft && (
                    <span className="text-[10px] inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400 font-medium">
                      <FileEdit className="h-2.5 w-2.5" />
                      草稿
                    </span>
                  )}
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
              </Link>

              {/* 浏览量 */}
              <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[60px]">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                  <Eye className="h-3 w-3" />
                  {(viewsMap[r.slug] ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted/60">阅读</span>
              </div>

              {/* 文件大小 */}
              <div className="hidden md:flex flex-col items-end text-[10px] text-muted shrink-0">
                <span>{(r.size / 1024).toFixed(1)} KB</span>
                <span className="opacity-50">{r.slug}.mdx</span>
              </div>

              {/* 在线访问（草稿没线上链接，不展示） */}
              {!r.draft && (
                <a
                  href={`/blog/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid place-items-center h-8 w-8 rounded-md text-muted hover:text-brand hover:bg-foreground/5 transition-colors shrink-0"
                  aria-label="查看线上"
                  title="查看线上"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {/* 老王说明：删除按钮 - 客户端组件，二次确认防误删 */}
              <DeletePostButton slug={r.slug} sha={r.sha} title={r.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
