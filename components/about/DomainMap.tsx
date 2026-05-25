"use client";

import { motion } from "framer-motion";
import { Factory, Sparkles, Code2 } from "lucide-react";

// 老王说明：领域地图 - 用 SVG 绘制三大方向的交叉关系
// 工业互联网 × 全栈开发 × AI 应用，三个圆相交，交集就是「工业 AI」金矿区
const nodes = [
  {
    key: "industry",
    title: "工业互联网",
    icon: Factory,
    desc: "iEMS / 能源管理 / 碳管理 / 网关",
    color: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-500/40",
    position: "md:translate-x-[-100px]",
  },
  {
    key: "fullstack",
    title: "全栈工程",
    icon: Code2,
    desc: "React / Python / 小程序 / 后台",
    color: "from-cyan-500 to-blue-500",
    ring: "ring-cyan-500/40",
    position: "md:translate-x-[100px]",
  },
  {
    key: "ai",
    title: "AI 应用",
    icon: Sparkles,
    desc: "RAG / Agent / 大模型落地",
    color: "from-fuchsia-500 to-purple-500",
    ring: "ring-fuchsia-500/40",
    position: "",
  },
];

export function DomainMap() {
  return (
    <div className="relative">
      <div className="grid md:grid-cols-3 gap-6 md:gap-4 relative">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          return (
            <motion.div
              key={n.key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className={`relative rounded-2xl border border-border/60 bg-card p-6 overflow-hidden hover:ring-2 ${n.ring} transition-all`}>
                <div className={`absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${n.color} opacity-25 blur-2xl`} />
                <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${n.color} text-white shadow-lg mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{n.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{n.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 交集说明 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 relative rounded-2xl bg-gradient-brand-soft border border-brand/30 p-6 text-center"
      >
        <p className="text-sm text-muted">
          三个方向的交集，就是我正在深耕的核心赛道：
        </p>
        <p className="mt-2 text-lg md:text-xl font-semibold">
          <span className="text-gradient-brand">「工业场景下的 AI 应用落地」</span>
        </p>
        <p className="mt-2 text-xs text-muted">
          把大模型从 Demo 推向车间，从 PPT 推向工厂。
        </p>
      </motion.div>
    </div>
  );
}
