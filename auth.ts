import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// 老王说明：NextAuth.js v5（Auth.js）配置
// - 仅 GitHub 登录（同时拿到 access_token 用于操作仓库）
// - 白名单：只有 ADMIN_GITHUB_LOGIN 列表里的 GitHub 用户能登入后台
// - JWT session（v5 默认），无需数据库
//
// 需要的环境变量：
//   AUTH_GITHUB_ID         - GitHub OAuth Client ID
//   AUTH_GITHUB_SECRET     - GitHub OAuth Client Secret
//   AUTH_SECRET            - JWT 签名密钥（运行 `npx auth secret` 生成）
//   ADMIN_GITHUB_LOGIN     - 白名单 GitHub 用户名（逗号分隔，如 "Albert0x"）
//   GITHUB_REPO_OWNER      - 仓库所有者（写入时用）
//   GITHUB_REPO_NAME       - 仓库名

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // 老王说明：要 repo 权限才能写文件到仓库
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    // 老王说明：登录拦截 - 不在白名单的 GitHub 用户拒绝登录
    async signIn({ profile }) {
      const allowed = (process.env.ADMIN_GITHUB_LOGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!allowed.length) {
        console.warn("[auth] ADMIN_GITHUB_LOGIN 未配置，拒绝所有登录");
        return false;
      }
      const login = profile?.login as string | undefined;
      const ok = Boolean(login && allowed.includes(login));
      if (!ok) console.warn(`[auth] 用户 ${login} 不在白名单`);
      return ok;
    },
    // 老王说明：把 GitHub access_token 存到 JWT，后续 API 路由用它操作仓库
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile?.login) {
        token.githubLogin = profile.login as string;
      }
      return token;
    },
    async session({ session, token }) {
      // 把 token 上的字段透出到 session
      (session as { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      (session as { githubLogin?: string }).githubLogin =
        token.githubLogin as string | undefined;
      return session;
    },
  },
});
