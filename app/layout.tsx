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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
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
