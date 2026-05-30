"use client";

import { motion } from "framer-motion";

// 老王说明：Hero 主标题 - 逐字浮现动画
// - 「你好，我是 Albert」按字符依次淡入上浮，营造打字/揭幕感
// - 名字部分套用流动渐变（text-gradient-flow），颜色持续流动
// - 纯 framer-motion，几乎零性能代价；尊重 prefers-reduced-motion
interface Props {
  prefix: string; // 例如 "你好，我是"
  name: string; // 例如 "Albert"
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

const charVariant = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function AnimatedChars({ text, gradient }: { text: string; gradient?: boolean }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          variants={charVariant}
          className={gradient ? "text-gradient-flow" : undefined}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  );
}

export function AnimatedHeadline({ prefix, name }: Props) {
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="show"
      className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.05]"
    >
      <AnimatedChars text={prefix} />
      <AnimatedChars text={` ${name}`} gradient />
    </motion.h1>
  );
}
