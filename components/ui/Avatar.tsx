"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

// 老王说明：通用头像组件
// - 优先显示 siteConfig.author.avatar 指定的图片（支持 SVG/PNG/JPG/WebP）
// - 图片加载失败时自动 fallback 到「渐变背景 + 首字母」，零白屏风险
// - 4 种尺寸适应不同位置（导航/页脚 sm，文章签名 md，about 大 lg/xl）
// - 支持 ring 装饰圈，about 页 hero 区用
// - 不使用 next/image：头像是小尺寸本地资源，无需优化器，且 SVG 走 next/image 需要 dangerouslyAllowSVG
type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, { className: string; text: string }> = {
  sm: { className: "h-8 w-8", text: "text-xs" },
  md: { className: "h-12 w-12", text: "text-sm" },
  lg: { className: "h-24 w-24", text: "text-2xl" },
  xl: { className: "h-32 w-32", text: "text-4xl" },
};

interface AvatarProps {
  /** 头像图片地址，默认走 siteConfig 配置 */
  src?: string;
  /** 显示的名字（用于 alt 和 fallback 首字母） */
  name?: string;
  /** 尺寸 */
  size?: AvatarSize;
  /** 是否加装饰光圈（about hero 用） */
  ring?: boolean;
  /** 透传 className 给最外层 */
  className?: string;
}

export function Avatar({
  src = siteConfig.author.avatar,
  name = siteConfig.author.name,
  size = "md",
  ring = false,
  className,
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const { className: sizeCls, text } = sizeMap[size];
  const initial = name.charAt(0).toUpperCase();

  const wrapperCls = cn(
    "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-gradient-brand",
    sizeCls,
    ring && "ring-4 ring-brand/20 shadow-xl shadow-brand/20",
    className
  );

  // 老王说明：图片加载失败时退化为首字母渐变方案
  if (errored || !src) {
    return (
      <span className={cn(wrapperCls, "text-white font-bold", text)} aria-label={name}>
        {initial}
      </span>
    );
  }

  return (
    <span className={wrapperCls}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="object-cover w-full h-full"
        onError={() => setErrored(true)}
        loading={size === "xl" || size === "lg" ? "eager" : "lazy"}
      />
    </span>
  );
}
