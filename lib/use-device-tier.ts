"use client";

import { useEffect, useState } from "react";

// 老王说明：设备性能分级 - 用于「炫酷优先 + 手机自动降级」策略
// - high：桌面端，开满效果（Bloom、密集粒子、高 DPR）
// - low：手机 / 窄屏 / 用户开了「减少动态效果」→ 砍掉 Bloom、降低粒子数与 DPR
// 仅在客户端运行；SSR 阶段先按 high 渲染占位，mount 后修正。
export type DeviceTier = "high" | "low";

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");

  useEffect(() => {
    const compute = (): DeviceTier => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isNarrow = window.innerWidth < 768;
      const fewCores =
        typeof navigator !== "undefined" &&
        typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 4;
      if (reduceMotion || isNarrow || fewCores) return "low";
      return "high";
    };

    setTier(compute());

    const onResize = () => setTier(compute());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return tier;
}
