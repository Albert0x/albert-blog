"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// 老王说明：通用滚动渐出动画包装器
// 在首页非 Hero 区的标题、卡片网格上使用，统一过渡风格
export function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
