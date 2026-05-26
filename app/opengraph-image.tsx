import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";
import { siteConfig } from "@/lib/site-config";

// 老王说明：站点级默认 OG 卡片
// 适用于：首页 / 项目页 / 留言板 / 关于页（没有自己 opengraph-image 的路由都用这个）
// runtime 用默认 Node.js（不指定 edge）- 因为 lib/mdx 用了 reading-time 包，依赖 Node.js stream 模块
export const contentType = "image/png";
export const size = OG_SIZE;
export const alt = siteConfig.title;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <OgTemplate
        title={`你好，我是 ${siteConfig.name}`}
        subtitle="把代码写进车间，把 AI 带入工厂。用全栈视角解决工业现场的真实问题。"
      />
    ),
    { ...size }
  );
}
