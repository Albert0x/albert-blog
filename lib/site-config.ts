// 老王说明：站点全局配置 - 一处修改，全站生效
// 任何静态文案、SEO、导航都从这里取
export const siteConfig = {
  name: "Albert",
  title: "Albert | 全栈开发者 · 工业互联网实践者 · AI 应用探索者",
  description:
    "把代码写进车间，把 AI 带入工厂。Albert的个人技术博客，分享工业互联网、能源碳管理、AI 应用与全栈工程实践。",
  url: "https://albert.dev", // TODO: 实际域名上线后替换
  author: {
    name: "Albert",
    role: "全栈开发者 / 工业互联网实践者 / AI 应用探索者",
    bio: "工业互联网与 AI 应用的学习者与实践者，以 React + Python 为主力栈，探索全栈工程与领域结合的可能。",
    avatar: "/avatar.png", // TODO: 上传头像后替换
    email: ".com", // TODO: 替换为真实邮箱
    github: "https://github.com/Albert0x", // Albert 的 GitHub 主页
  },
  // 顶部导航配置
  nav: [
    { label: "首页", href: "/" },
    { label: "博客", href: "/blog" },
    { label: "项目", href: "/projects" },
    { label: "关于", href: "/about" },
    { label: "留言板", href: "/guestbook" },
  ],
  // ===== Giscus 评论配置 =====
  // 老王说明：基于 GitHub Issues 的评论系统，零运维零成本
  // 配置步骤（一次性）：
  //   1. 在 GitHub 创建一个公开仓库（比如 albert-blog-comments）
  //   2. 给仓库装上 Giscus App: https://github.com/apps/giscus
  //   3. 打开仓库 Discussions 功能（Settings → General → Features → Discussions ✓）
  //   4. 去 https://giscus.app 填配置，拿到 repoId 和 categoryId
  //   5. 把下面 5 个 TODO 字段填好就 OK
  giscus: {
    repo: "Albert0x/albert-blog" as `${string}/${string}`, // 博客评论数据源仓库
    repoId: "R_kgDOSnFaHA", // TODO: 从 giscus.app 复制
    category: "Announcements", // TODO: Discussion 分类名
    categoryId: "DIC_kwDOSnFaHM4C92K0", // TODO: 从 giscus.app 复制
    // mapping: 文章用 pathname（每篇文章一个独立 Issue）
    mapping: "pathname" as const,
    // 留言板用 specific term，所有留言聚在同一个 Issue
    guestbookTerm: "guestbook",
    // 开关
    reactionsEnabled: true,
    inputPosition: "top" as const, // 输入框放顶部
    lang: "zh-CN",
  },

  // 三大内容方向 - 首页和关于页都会用到
  pillars: [
    {
      icon: "Factory",
      title: "工业互联网实战",
      desc: "iEMS 系统集成、能源碳管理、工业网关协议、SCADA / MES / IoT。",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      icon: "Sparkles",
      title: "AI 应用探索",
      desc: "RAG、Agent、工业场景与 AI 的结合，探索大模型在领域知识库的落地路径。",
      gradient: "from-violet-500 to-cyan-500",
    },
    {
      icon: "Code2",
      title: "全栈工程实战",
      desc: "React 工程化、Python 后端、后台管理系统、小程序 unibest 实践。",
      gradient: "from-cyan-500 to-indigo-500",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
