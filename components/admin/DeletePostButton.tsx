"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

// 老王说明：删除文章按钮 + 二次确认弹窗
// - 走 DELETE /api/admin/posts/[slug]，需要传 sha（GitHub 乐观锁）
// - 成功后 router.refresh() 刷新管理页 RSC 数据
// - 二次确认：必须打字输入 "delete" 才放行，防误删
//   通用确认词比 slug 更直观，不管文章 slug 多长都能秒删
interface Props {
  slug: string;
  sha: string;
  title?: string;
}

// 老王说明：通用确认词，全小写，6 字母，难手滑误中
const CONFIRM_WORD = "delete";

export function DeletePostButton({ slug, sha, title }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 老王说明：必须打字输入 CONFIRM_WORD 才放行，防止手抖
  const canDelete = confirmInput.trim().toLowerCase() === CONFIRM_WORD && !isPending;

  function closeDialog() {
    if (isPending) return; // 删除中不让关
    setOpen(false);
    setConfirmInput("");
    setError(null);
  }

  async function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/posts/${slug}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sha }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ message: "未知错误" }));
          setError(data.message ?? `删除失败 (${res.status})`);
          return;
        }
        // 成功：关弹窗 + 刷新列表
        setOpen(false);
        setConfirmInput("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "网络错误");
      }
    });
  }

  return (
    <>
      {/* 删除按钮（外部触发） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid place-items-center h-8 w-8 rounded-md text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
        aria-label="删除文章"
        title="删除文章"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* 确认弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* 头部 */}
            <div className="flex items-start gap-3 p-5 border-b border-border/60">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/10 text-rose-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">确认删除文章</h3>
                <p className="text-xs text-muted mt-0.5 truncate">
                  {title ?? slug}
                </p>
              </div>
            </div>

            {/* 正文 */}
            <div className="p-5 space-y-4 text-sm">
              <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-3 text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                <p className="font-medium mb-1">⚠️ 此操作会：</p>
                <ul className="list-disc list-inside space-y-0.5 opacity-90">
                  <li>在 GitHub 仓库 main 分支 commit 一个删除提交</li>
                  <li>Vercel 自动重新部署，线上路由立刻 404</li>
                  <li>历史 commit 里文件仍可恢复</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5">
                  输入{" "}
                  <code className="text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">
                    {CONFIRM_WORD}
                  </code>{" "}
                  以确认删除：
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  disabled={isPending}
                  placeholder={CONFIRM_WORD}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border/60 bg-foreground/[0.02]">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-rose-500/30 hover:bg-rose-600 disabled:bg-foreground/10 disabled:text-muted disabled:shadow-none disabled:cursor-not-allowed transition-all"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isPending ? "正在删除…" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
