"use client";

import { motion } from "framer-motion";

// 老王说明：经历时间线（已脱敏 - 学习实践口吻，不涉及真实雇主/客户信息）
// TODO: Albert 可按自己的实际情况调整年份与描述
interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  desc: string;
  highlights?: string[];
  current?: boolean;
}

const timeline: TimelineItem[] = [
  {
    year: "现在",
    title: "工业互联网 × AI 应用",
    subtitle: "学习与实践阶段",
    desc: "深入学习工业系统集成的架构与协议，同时探索 RAG / Agent 在工业知识库场景的工程化落地。",
    highlights: [
      "研究工业能源 / 碳管理的系统架构",
      "动手实践工业 RAG 知识助手",
      "持续输出学习笔记与实践记录",
    ],
    current: true,
  },
  {
    year: "更早",
    title: "全栈工程深耕",
    subtitle: "React + Python 主力栈",
    desc: "以 React + Python 为主力栈，参与多个 Web 应用与后台管理系统的设计与实现，覆盖工业、OA、报表等多个业务领域。",
    highlights: [
      "沉淀通用后台管理模板",
      "unibest 小程序框架实战学习",
      "前后端架构经验积累",
    ],
  },
  {
    year: "起步",
    title: "前端入行",
    subtitle: "起步阶段",
    desc: "从前端入行，逐步扩展到后端、工业系统集成、AI 应用方向，形成全栈 + 领域 know-how 的复合能力。",
  },
];

export function Timeline() {
  return (
    <div className="relative pl-8 md:pl-10">
      {/* 时间线竖线 */}
      <div className="absolute left-2 md:left-3 top-2 bottom-2 w-px bg-gradient-to-b from-brand via-brand-light to-brand-accent opacity-50" />

      <div className="space-y-10">
        {timeline.map((t, i) => (
          <motion.div
            key={t.year + t.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            {/* 圆点 */}
            <div
              className={`absolute -left-8 md:-left-10 top-1 h-5 w-5 rounded-full bg-gradient-brand shadow-lg ${t.current ? "ring-4 ring-brand/20 animate-pulse" : ""}`}
            />

            <div className="text-xs text-muted mb-1.5 flex items-center gap-2">
              {t.year}
              {t.current && (
                <span className="inline-flex items-center text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5">
                  ● 当前
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">{t.title}</h3>
            <p className="text-sm text-brand mb-2">{t.subtitle}</p>
            <p className="text-sm text-muted leading-relaxed mb-3">{t.desc}</p>
            {t.highlights && (
              <ul className="space-y-1.5">
                {t.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-xs text-muted">
                    <span className="text-brand mt-0.5">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
