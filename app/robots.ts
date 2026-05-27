import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// 老王说明：robots.txt - 告诉爬虫哪些能爬哪些不能爬
// 拒绝爬：管理后台、API 接口、登录页（这些不该被收录）
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
