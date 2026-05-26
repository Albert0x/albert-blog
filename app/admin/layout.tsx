import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

// 老王说明：后台布局
// - 服务端取登录态 + 用户信息
// - 没登录的 fallback（middleware 已经守过一次，这里再防御一次）
// - 注意：login 页面不走这个 layout（因为 admin/login 已经独立路由）
export const metadata: Metadata = {
  title: "博客后台",
  robots: { index: false, follow: false }, // 不让搜索引擎收录后台
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 防御：未登录拦截（middleware 已挡一次，双保险）
  if (!session?.user) {
    redirect("/admin/login");
  }

  // 登出 Server Action - 给 AdminNav 用
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  const sessionWithGithub = session as typeof session & {
    githubLogin?: string;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav
        user={{
          name: session.user.name,
          image: session.user.image,
          githubLogin: sessionWithGithub.githubLogin,
        }}
        signOutAction={handleSignOut}
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
