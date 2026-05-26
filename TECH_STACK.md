# Albert Blog · 技术栈文档

> 一个集成了 3D 视觉、AI 助手、匿名点赞、暗色模式的全栈个人博客
> 在线访问：[albert0x.vercel.app](https://albert0x.vercel.app)
> 源码：[github.com/Albert0x/albert-blog](https://github.com/Albert0x/albert-blog)

---

## 📋 目录

- [项目定位](#项目定位)
- [整体架构](#整体架构)
- [技术栈一览](#技术栈一览)
- [关键技术决策](#关键技术决策)
- [核心功能拆解](#核心功能拆解)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署架构](#部署架构)
- [安全防线](#安全防线)
- [性能与成本](#性能与成本)

---

## 项目定位

为 **工业互联网 × AI 应用 × 全栈工程** 方向的开发者打造的个人技术博客，主要展示：

- 真实项目实践与技术沉淀
- AI 应用工程化能力（**博客本身嵌入 RAG 助手**）
- 现代前端工程化最佳实践（Next.js 14 / React Server Components / Edge Functions）

---

## 整体架构

```
┌───────────────────────────────────────────────────────────────┐
│                       访客 / 浏览器                            │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS
                             ▼
┌───────────────────────────────────────────────────────────────┐
│            Vercel Edge Network (CDN + Hosting)                │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│              Next.js 14 (App Router + RSC)                    │
│  ┌──────────────┬──────────────────┬───────────────────────┐  │
│  │ Static Pages │ Dynamic Pages    │ API Routes            │  │
│  │ / /blog/* …  │ /api/chat (SSR)  │ /api/likes/[slug]     │  │
│  │ /projects …  │ OG Image (Edge)  │ /api/chat (Stream)    │  │
│  └──────────────┴──────────────────┴───────────────────────┘  │
└──────────┬──────────────┬──────────────┬──────────────┬───────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
   ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐
   │  MDX 文件  │  │  Upstash   │  │ DeepSeek │  │   Giscus    │
   │ (内容存储) │  │   Redis    │  │   API    │  │  (GH Disc.) │
   │            │  │  (点赞)    │  │  (LLM)   │  │   (评论)    │
   └────────────┘  └────────────┘  └──────────┘  └─────────────┘
```

**架构亮点：**
- **零数据库**：内容文件化（MDX）、评论用 GitHub Discussions、点赞用 KV，彻底无 SQL 依赖
- **零运维**：Vercel + 第三方服务，开发者只管写代码
- **边缘渲染**：OG 卡片在 Edge Runtime 生成；静态页面 CDN 分发
- **流式响应**：AI 助手用 SSE 实现打字机效果

---

## 技术栈一览

### 🎨 前端框架与 UI

| 类别 | 选型 | 版本 | 用途 |
|---|---|---|---|
| 框架 | **Next.js** | 14.2 | App Router + RSC + SSG/SSR/Edge 全用上 |
| 语言 | **TypeScript** | 5.x | 全项目类型安全 |
| UI 库 | **React** | 18 | 服务端 + 客户端组件混合 |
| 样式 | **Tailwind CSS** | 3.4 | 原子化 CSS |
| 排版 | **@tailwindcss/typography** | 0.5 | Markdown 文章排版 |
| 动画 | **Framer Motion** | 12 | 滚动入场 / 微交互 |
| 图标 | **Lucide React** | 0.4 | 矢量图标库 |
| 工具 | **clsx + tailwind-merge** | — | 条件 className 合并 |

### 🌐 3D 视觉

| 选型 | 版本 | 用途 |
|---|---|---|
| **Three.js** | 0.18 | WebGL 渲染核心 |
| **@react-three/fiber** | 8.x | React 声明式接入 Three.js |
| **@react-three/drei** | 9.x | 浮动、变形材质、HDR 环境光 helpers |

> 首页 Hero 区悬浮 5 个几何体（二十面体 / 八面体 / 圆环 / 十二面体），鼠标视差跟随。

### 📝 内容系统（MDX）

| 选型 | 用途 |
|---|---|
| **next-mdx-remote** | 服务端渲染 MDX |
| **gray-matter** | 解析文章 frontmatter |
| **remark-gfm** | GitHub 风格 Markdown（表格、删除线、任务列表）|
| **rehype-pretty-code (Shiki)** | 代码高亮，**亮 / 暗双主题** |
| **rehype-slug** | 标题加 id 锚点 |
| **rehype-autolink-headings** | 鼠标悬浮显示 `#` 链接 |
| **reading-time** | 自动计算阅读时长 |

### 🤖 AI 与 RAG

| 选型 | 用途 |
|---|---|
| **ai (Vercel AI SDK)** | 流式响应 + UI Message Stream |
| **@ai-sdk/react** | `useChat` Hook 管理对话状态 |
| **@ai-sdk/openai-compatible** | 适配 OpenAI 兼容协议（DeepSeek / 通义 / Moonshot）|
| **MiniSearch** | 全文检索（BM25），中文 2-gram 分词 |
| **react-markdown** | 渲染 AI 输出的 Markdown |
| **DeepSeek API** | 国产 LLM，¥1/百万 token，不要 VPN |

> 完整 RAG 流程：**Retrieval（MiniSearch 检索 Top 3 文章片段）→ Augmented（注入 system prompt）→ Generation（DeepSeek 流式生成）→ 返回引用文章卡片**

### 💖 存储与互动

| 选型 | 用途 |
|---|---|
| **Upstash Redis (Vercel KV)** | 文章点赞计数 |
| **Giscus** | 评论系统，数据存 GitHub Discussions |
| **@giscus/react** | React 封装 |

### 🌙 主题与体验

| 选型 | 用途 |
|---|---|
| **next-themes** | 暗 / 亮 / 跟随系统三态切换 |
| **next/og** | 动态生成 OG 分享卡片（1200×630）|

### 🛠 工具与杂项

| 选型 | 用途 |
|---|---|
| **zod** | API 输入校验 |
| **kill-port** | 端口冲突时一键清理 |

---

## 关键技术决策

### 1. App Router 而非 Pages Router
**理由**：Next.js 14 官方推荐，React Server Components 是未来。
**收益**：默认 SSR + 流式响应、布局嵌套、Server Actions、更小的客户端 bundle。

### 2. MDX 文件而非 CMS / 后台管理
**理由**：个人博客无需多人协作，文件式更直观且 git 友好。
**收益**：版本管理 = git 提交、编辑 = 任何编辑器、部署 = `git push`。

### 3. RAG 检索用 MiniSearch 而非向量数据库
**理由**：博客内容量小（数十篇文章），关键词检索（BM25）足以覆盖需求；向量化引入 OpenAI embeddings 成本和 Qdrant 部署复杂度。
**收益**：**零外部 API 依赖**，构建期不需要嵌入向量，本地内存索引即可，**月成本 0**。
**升级路径**：未来内容多了再上 Embeddings + Qdrant。

### 4. DeepSeek 用 `@ai-sdk/openai-compatible` 而非 `@ai-sdk/openai`
**踩过的坑**：`@ai-sdk/openai@3.x` 默认走 OpenAI 新的 `/v1/responses` 接口，而 DeepSeek 只支持经典的 `/v1/chat/completions`。
**解法**：换成 `openai-compatible` 专用适配器。
**额外收益**：未来想换 Moonshot / 通义 / 智谱，只改 baseURL。

### 5. 点赞用 Upstash Redis 而非数据库
**理由**：KV 写入快、Vercel 免费集成、数据简单（slug → count 映射）。
**配合 Cookie 防重复**：每浏览器对每篇文章只能点 1 次。

### 6. 评论用 Giscus 而非自建
**理由**：用户体系（认证 + 防 spam）由 GitHub 托管，零运维零数据库。
**附带好处**：评论数据天然公开 + 可在 GitHub Mobile 实时收到通知。

### 7. 头像走 GitHub 直链（`github.com/Albert0x.png`）
**理由**：换 GitHub 头像 → 博客自动同步，0 维护。
**Fallback**：图片加载失败自动降级为渐变色 + 首字母 SVG。

### 8. 三道安全防线 + Kill Switch
**理由**：AI 接口 + 点赞接口都对外开放，必须防滥用。
**实现**：
- 速率限制（IP 三级 + 全站日配额）
- Origin 校验（拒绝跨站直调）
- 环境变量 Kill Switch（`AI_ENABLED=false` 一键下线）

---

## 核心功能拆解

| 功能 | 技术亮点 | 文件入口 |
|---|---|---|
| **3D 首页 Hero** | Three.js + R3F + 鼠标视差 + 动态加载（`ssr: false`） | `components/three/HeroScene.tsx` |
| **MDX 文章系统** | Shiki 双主题代码 + 标题锚点 + 阅读时长 + RSC 渲染 | `app/blog/[slug]/page.tsx` |
| **OG 卡片生成** | next/og + Satori，每篇文章一张独立 PNG | `app/blog/[slug]/opengraph-image.tsx` |
| **AI 博客助手 RAG** | DeepSeek 流式 + MiniSearch 检索 + 引用追溯 | `app/api/chat/route.ts` |
| **匿名点赞** | Upstash Redis + Cookie 去重 + 乐观更新 + 飘心动画 | `components/blog/LikeButton.tsx` |
| **暗色模式** | next-themes + Giscus 主题联动 + 防 SSR 闪烁 | `components/theme/ThemeProvider.tsx` |
| **Giscus 评论** | GitHub Discussions 驱动 + pathname 映射 | `components/comments/Giscus.tsx` |
| **领域地图** | 工业 / AI / 全栈三方向 SVG 可视化 | `components/about/DomainMap.tsx` |
| **时间线** | Framer Motion 滚动进入 + 渐变竖线 | `components/about/Timeline.tsx` |

---

## 项目结构

```
albert-blog/
├── app/                            # Next.js App Router 路由
│   ├── about/page.tsx              # 关于我
│   ├── api/
│   │   ├── chat/route.ts           # AI 助手流式接口
│   │   └── likes/[slug]/route.ts   # 点赞 GET/POST
│   ├── blog/
│   │   ├── page.tsx                # 文章列表
│   │   └── [slug]/
│   │       ├── page.tsx            # 文章详情
│   │       └── opengraph-image.tsx # 文章 OG 卡
│   ├── projects/page.tsx           # 项目集
│   ├── guestbook/page.tsx          # 留言板
│   ├── opengraph-image.tsx         # 默认 OG
│   ├── twitter-image.tsx           # Twitter 卡片
│   ├── layout.tsx                  # 根布局（ThemeProvider + Navbar + ChatWidget）
│   └── globals.css                 # 全局样式 + CSS 变量
├── components/
│   ├── about/                      # 关于页 (DomainMap, Timeline, SkillMatrix)
│   ├── blog/                       # 文章相关 (PostCard, MdxContent, LikeButton)
│   ├── chat/                       # AI 助手 UI (Widget, Panel, Message)
│   ├── comments/Giscus.tsx         # 评论组件
│   ├── common/Footer.tsx           # 通用组件
│   ├── home/AnimatedSection.tsx    # 首页滚动动画包装
│   ├── nav/Navbar.tsx              # 顶部导航（毛玻璃 + 头像 + 主题切换）
│   ├── projects/ProjectCard.tsx    # 项目卡
│   ├── theme/                      # 暗色模式
│   ├── three/                      # 3D 场景
│   └── ui/                         # 基础 UI (Avatar, Container)
├── content/
│   └── posts/                      # MDX 文章源文件
├── lib/
│   ├── ai/                         # AI 模块
│   │   ├── knowledge.ts            # RAG 知识库 + MiniSearch
│   │   ├── provider.ts             # DeepSeek 客户端
│   │   └── rate-limit.ts           # 速率限制 + Origin 校验
│   ├── likes.ts                    # Upstash Redis 抽象
│   ├── mdx.ts                      # MDX 解析（文件 → 元信息）
│   ├── mdx-options.ts              # MDX 渲染插件配置
│   ├── og-template.tsx             # OG 卡片共享模板
│   ├── projects.ts                 # 项目数据
│   ├── site-config.ts              # 站点级配置（单点维护）
│   └── utils.ts                    # cn / formatDate 工具
├── public/
│   ├── avatar.svg                  # 默认头像（fallback）
│   └── fonts/                      # Geist 字体
├── .env.local.example              # 环境变量示例
├── next.config.mjs                 # Next.js 配置
├── tailwind.config.ts              # Tailwind 主题与渐变
├── tsconfig.json                   # TS 配置（target ES2020）
└── package.json
```

---

## 开发指南

### 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9（推荐）

### 启动开发

```bash
# 安装依赖
pnpm install

# 启动 dev（端口 3001）
pnpm dev

# 端口被占用时
pnpm dev:fresh

# 生产构建
pnpm build

# 启动生产 server
pnpm start

# Lint
pnpm lint
```

### 环境变量

复制 `.env.local.example` 为 `.env.local`，填入：

| 变量 | 必填 | 用途 |
|---|---|---|
| `DEEPSEEK_API_KEY` | AI 助手需要 | DeepSeek API Key |
| `AI_ENABLED` | 否，默认 `true` | 紧急 Kill Switch，设 `false` 下线 AI |
| `KV_REST_API_URL` | 点赞功能需要 | Upstash Redis URL |
| `KV_REST_API_TOKEN` | 点赞功能需要 | Upstash Redis Token |

**未配置时优雅降级**：未配 DeepSeek → AI 按钮返回 503；未配 KV → 点赞按钮自动隐藏；**博客其他功能不受影响**。

### 添加新文章

1. 在 `content/posts/` 新建 `.mdx` 文件
2. 加 frontmatter：
   ```yaml
   ---
   title: 标题
   description: 摘要（用于卡片 + SEO + OG）
   date: 2026-05-26
   category: 工业互联网 / AI 应用 / 全栈工程 / 随笔
   tags: [关键词1, 关键词2]
   ---
   ```
3. 写正文 Markdown
4. `git push` → Vercel 自动部署

### 修改站点配置

所有静态文案 / 导航 / 联系方式 / AI 配置都在 `lib/site-config.ts`，**单点维护**。

---

## 部署架构

### Vercel（Hosting + Edge Network）

- **代码托管**：GitHub
- **CI/CD**：每次 `git push main` 自动构建部署
- **预览部署**：每个 PR / 分支自动生成临时域名
- **CDN**：全球边缘节点（亚洲节点：Tokyo / Singapore）
- **HTTPS**：自动签发 Let's Encrypt 证书

### Upstash Redis（点赞数据存储）

- **托管**：通过 Vercel Marketplace 一键创建
- **免费额度**：每月 10,000 commands
- **延迟**：< 50ms（全球分布）

### DeepSeek（LLM）

- **国产**：不需要 VPN，国内访问稳定
- **价格**：约 ¥1 / 百万 token（输入），¥2 / 百万 token（输出）
- **充值策略**：小额 ¥10，物理锁定损失上限

### GitHub Discussions（评论）

- **持久化**：免费、永久
- **管理**：可在 GitHub 网页 / App 直接回复
- **反垃圾**：必须 GitHub 登录才能发，机器人极少

---

## 安全防线

针对对外开放的 API（`/api/chat`、`/api/likes/[slug]`）实施多层防御：

```
访客请求 ──→ Kill Switch (env)        → 503 维护中
        ──→ KV/AI 是否配置            → 503 未配置
        ──→ Origin 校验                → 403 跨站拒绝
        ──→ 全站日配额（500/天）        → 429 全站达限
        ──→ 单 IP 速率（10/分 60/时 200/天） → 429 限流
        ──→ Cookie 去重（点赞）         → 200 不真 +1
        ──→ 消息长度限制（AI）          → 413 请精简
        ──→ ✅ 处理请求
```

**钱包级兜底**：DeepSeek 平台只充 ¥10，物理锁定最大损失。

详细实现见 `lib/ai/rate-limit.ts`。

---

## 性能与成本

### 构建产物（pnpm build 输出）

```
○ 静态预渲染：/, /blog, /projects, /about, /guestbook
● SSG 预生成：/blog/[slug]（每篇文章 + 每张 OG 卡）
ƒ 服务端按需：/api/chat, /api/likes/[slug]

First Load JS: 87.4 kB（共享）
单页增量：176B ~ 5 kB
```

### 月成本

| 项 | 成本 |
|---|---|
| Vercel Hosting | **¥0**（Hobby 免费版） |
| Upstash Redis | **¥0**（免费额度内） |
| GitHub Discussions | **¥0**（永久免费） |
| DeepSeek API | **< ¥1**（个人博客流量） |
| **合计** | **< ¥1 / 月** |

---

## 简历亮点话术

> 「我做了一个**集成 RAG 架构 AI 助手的个人技术博客**。
>
> 整体基于 Next.js 14 App Router + RSC，**MDX 文件式内容管理**支持 Shiki 双主题代码高亮、自动 OG 卡片生成、阅读时长计算；
>
> **AI 助手部分实现了完整 RAG 流程** —— 用 MiniSearch 对博客做关键词检索（中文 2-gram 分词），Top 3 片段注入 system prompt，DeepSeek 流式生成回答，并通过自定义 message metadata 把引用源文章流式返回前端展示；
>
> **匿名点赞系统**用 Upstash Redis 计数 + Cookie 去重 + Framer Motion 飘心动画，配合 IP 三级速率限制 + 全站日配额 + Kill Switch 三道防线抵御滥用；
>
> 整套部署在 Vercel，**月成本不到 ¥1**，国内国外双向访问，代码全部开源。」

---

## License

代码部分：MIT License
文章内容：CC BY-NC-SA 4.0

---

> Built with ☕ by **Albert** · 2026
