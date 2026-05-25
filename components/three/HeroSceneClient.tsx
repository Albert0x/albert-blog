"use client";

import dynamic from "next/dynamic";

// 老王说明：动态加载 3D 场景，关闭 SSR
// 原因：Three.js 依赖 window / WebGL，SSR 会炸；同时减小首屏 JS 包体积
// 加载期间显示渐变光晕兜底，避免白屏闪烁
const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-brand opacity-30 blur-3xl animate-float-slow" />
        <div className="absolute top-2/3 right-10 h-[200px] w-[200px] rounded-full bg-brand-accent opacity-25 blur-3xl animate-float-slow" />
      </div>
    ),
  }
);

export function HeroSceneClient() {
  return <HeroScene />;
}
