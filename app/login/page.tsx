import { Github, ShieldCheck } from "lucide-react";
import { signIn } from "@/auth";
import { siteConfig } from "@/lib/site-config";

// 老王说明：登录页
// - ⚠️ 路径必须放在 /login 而不是 /admin/login，否则会被 admin/layout 守卫造成死循环
// - 唯一登录方式：GitHub OAuth
// - 通过 Server Action 触发 signIn，安全且不暴露 client_id
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;
  const callbackUrl = from && from.startsWith("/admin") ? from : "/admin";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-card to-background">
      <div className="relative w-full max-w-md">
        {/* 背景光晕 */}
        <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-gradient-brand opacity-30" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-brand-accent opacity-25" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md p-8 shadow-2xl">
          {/* 标题区 */}
          <div className="flex items-center gap-3 mb-1">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white font-bold shadow-lg shadow-brand/30">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {siteConfig.name}<span className="text-muted">.dev</span>
              </h1>
              <p className="text-xs text-muted">博客管理后台</p>
            </div>
          </div>

          <div className="mt-8 mb-6 flex items-center gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" />
            仅授权账号可访问
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
              {error === "AccessDenied"
                ? "登录被拒绝：你的 GitHub 账号不在白名单。"
                : `登录失败：${error}`}
            </div>
          )}

          {/* GitHub 登录按钮 */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-white text-white dark:text-zinc-900 py-3 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Github className="h-5 w-5" />
              使用 GitHub 登录
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted">
            登录即同意访问你的 GitHub 公开信息和指定仓库
          </div>
        </div>

        {/* 返回博客 */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-muted hover:text-brand transition-colors"
          >
            ← 返回博客首页
          </a>
        </div>
      </div>
    </main>
  );
}
