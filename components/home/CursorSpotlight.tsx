"use client";

import { useEffect, useRef } from "react";

// 老王说明：鼠标聚光灯 - 一团柔光跟随光标移动
// - 绝对定位在 Hero 区内，pointer-events-none 不挡交互
// - 用 requestAnimationFrame 平滑插值，避免直接跟随的生硬感
// - 触屏/减少动效设备不渲染（无鼠标场景无意义）
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || isTouch) return;

    const el = ref.current;
    if (!el) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    const cur = { ...target };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      el.style.opacity = "1";
    };

    const loop = () => {
      cur.x += (target.x - cur.x) * 0.12;
      cur.y += (target.y - cur.y) * 0.12;
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-[5] h-[420px] w-[420px] rounded-full opacity-0 blur-[80px] transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(6,182,212,0.18) 45%, transparent 70%)",
      }}
    />
  );
}
