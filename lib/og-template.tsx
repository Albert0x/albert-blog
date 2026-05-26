import { siteConfig } from "@/lib/site-config";

// 老王说明：OG 卡片共享模板
// - 1200×630 是 Facebook / X / 微信 / LinkedIn 等社交平台公认的最佳尺寸
// - next/og 用 Satori 渲染，只支持 inline 样式 + 部分 flex 属性，不能用 Tailwind 类
// - 不嵌真实头像图：Satori 加载远程图慢，用 CSS 圆 + 首字母代替更稳

// OG 卡片标准尺寸常量
export const OG_SIZE = { width: 1200, height: 630 } as const;

// 老王说明：默认 OG 模板（首页 / 关于 / 项目 / 留言板 都能复用）
interface OgTemplateProps {
  /** 顶部小标签 - 比如分类名 */
  badge?: string;
  /** 主标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
}

export function OgTemplate({ badge, title, subtitle }: OgTemplateProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0A0A18",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 老王说明：背景渐变光晕 - 用绝对定位的彩色 div 模拟 blur 光晕 */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -250,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 400,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />

      {/* 主体内容 */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
        }}
      >
        {/* 顶部：站点标识 + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Logo - A 字母 */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 32,
                fontWeight: 800,
                boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              }}
            >
              A
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ color: "white", fontSize: 28, fontWeight: 700, display: "flex" }}>
                {siteConfig.name}
                <span style={{ color: "#94949E", fontWeight: 400, marginLeft: 2 }}>.dev</span>
              </div>
              <div style={{ color: "#94949E", fontSize: 16, marginTop: 4 }}>
                Industrial × AI × Full-stack
              </div>
            </div>
          </div>

          {badge && (
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(99,102,241,0.2)",
                color: "#A5B4FC",
                fontSize: 18,
                fontWeight: 500,
                border: "1px solid rgba(165,180,252,0.4)",
                display: "flex",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* 中部：主标题 + 副标题 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: title.length > 30 ? 60 : 76,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "90%",
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 26,
                color: "#94949E",
                lineHeight: 1.4,
                maxWidth: "85%",
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* 底部：作者署名 + 渐变条 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "#94949E", fontSize: 20, display: "flex" }}>
            By {siteConfig.name} · 全栈开发者
          </div>
          <div
            style={{
              width: 200,
              height: 4,
              borderRadius: 999,
              background: "linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
