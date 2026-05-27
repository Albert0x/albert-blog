import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/common/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { siteConfig } from "@/lib/site-config";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// 老王说明：构建 verification.other 对象（只在配了值时才放进去，避免 undefined 值触发 TS 类型错误）
function buildVerificationOther(): Record<string, string> {
  const other: Record<string, string> = {};
  if (siteConfig.verification.baidu) {
    other["baidu-site-verification"] = siteConfig.verification.baidu;
  }
  if (siteConfig.verification.bing) {
    other["msvalidate.01"] = siteConfig.verification.bing;
  }
  return other;
}

// 老王说明：站点级 SEO 元信息，从 siteConfig 取，单点维护
export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author.name }],
  keywords: [
    "Albert",
    "个人博客",
    "工业互联网",
    "能源管理",
    "碳管理",
    "AI 应用",
    "RAG",
    "Agent",
    "React",
    "Python",
    "全栈开发",
  ],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website",
  },
  // 老王说明：搜索引擎站长验证 meta（在 siteConfig.verification 配好后自动渲染）
  // 任一为空时 Next.js 自动不输出对应 meta，不影响页面
  verification: {
    google: siteConfig.verification.google || undefined,
    other: buildVerificationOther(),
  },
  // 让搜索引擎友好地知道站点的备用 feed
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": `${siteConfig.url}/feed.xml`,
    },
  },
  // 默认让爬虫尽量收录（admin 等敏感页已在 robots.ts 单独 disallow）
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// 老王说明：全站 JSON-LD 结构化数据
// 让搜索引擎更好地理解「这是个个人博客 + Albert 是博主」
// 测试工具：https://search.google.com/test/rich-results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "zh-CN",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.author.name,
      url: siteConfig.url,
      image: siteConfig.author.avatar,
      description: siteConfig.author.bio,
      sameAs: [siteConfig.author.github].filter(Boolean),
      jobTitle: siteConfig.author.role,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 老王说明：全站 JSON-LD（Person + WebSite），给搜索引擎吃的结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        {/* 老王说明：ThemeProvider 必须包在最外层，否则 useTheme 读不到上下文 */}
        <ThemeProvider>
          <Navbar />
          {/* 顶部留出 Navbar 高度 */}
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          {/* 老王说明：AI 博客助手 - 全站右下角浮动按钮，未配置 API Key 时调用会提示，不影响其他功能 */}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
