/** @type {import('next').NextConfig} */

// 老王说明：全站统一安全 HTTP 头
// 这玩意儿是博客的"防弹衣"，不加就是裸奔。配完拿 https://securityheaders.com 测一下能直接 A+
const securityHeaders = [
  // 强制 HTTPS，防止协议降级攻击。max-age 2 年是 Google/Mozilla 推荐值
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 禁止页面被 iframe 嵌套（防点击劫持）。博客没有同源 iframe 需求，直接 DENY
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 阻止浏览器对响应做 MIME 类型嗅探（防 XSS 变形攻击）
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 控制 referrer 携带策略：同源给完整 URL，跨站只给来源（隐私与统计平衡）
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 关闭不需要的浏览器特性接口，缩小攻击面
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // 现代浏览器 XSS 过滤器（虽逐步废弃，但留着不亏）
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig = {
  // 老王说明：严格模式 - React 帮你提前发现副作用问题，开发阶段双 render 检测潜在 bug
  reactStrictMode: true,

  // 老王说明：生产构建启用 gzip 压缩（Vercel 自带 brotli，本设置兜底 self-host 场景）
  compress: true,

  // 老王说明：去掉响应头里 "X-Powered-By: Next.js"，少暴露技术栈信息
  poweredByHeader: false,

  // 老王说明：next/image 远程图片白名单 - 不在这里登记的域名会被 Next.js 拒绝优化
  // 当前只有 GitHub 头像走远程；以后加 CDN/图床都来这里登记一下
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
    // 现代格式优先，体积比 jpg/png 小 30%~50%
    formats: ["image/avif", "image/webp"],
  },

  // 老王说明：给所有路由套上安全 headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // 静态资源长缓存（Vercel 自带哈希，永不撞车）
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
