"use client";

import { motion } from "framer-motion";

// 老王说明：技术栈矩阵 - 按方向分组展示
// 每组用一个色系，徽章 hover 有发光效果
interface SkillGroup {
  title: string;
  gradient: string;
  skills: { name: string; level: "熟练" | "实战" | "了解" }[];
}

const groups: SkillGroup[] = [
  {
    title: "前端",
    gradient: "from-cyan-500 to-blue-500",
    skills: [
      { name: "React", level: "熟练" },
      { name: "TypeScript", level: "熟练" },
      { name: "Next.js", level: "实战" },
      { name: "Vue 3", level: "实战" },
      { name: "Tailwind CSS", level: "熟练" },
      { name: "Ant Design Pro", level: "熟练" },
      { name: "ECharts", level: "熟练" },
      { name: "Zustand / Pinia", level: "熟练" },
    ],
  },
  {
    title: "后端",
    gradient: "from-emerald-500 to-teal-500",
    skills: [
      { name: "Python", level: "熟练" },
      { name: "FastAPI", level: "实战" },
      { name: "PostgreSQL", level: "实战" },
      { name: "InfluxDB", level: "实战" },
      { name: "Redis", level: "实战" },
      { name: "Docker", level: "实战" },
    ],
  },
  {
    title: "工业互联网",
    gradient: "from-indigo-500 to-violet-500",
    skills: [
      { name: "iEMS", level: "熟练" },
      { name: "1051 网关", level: "实战" },
      { name: "Modbus RTU/TCP", level: "实战" },
      { name: "MQTT", level: "实战" },
      { name: "OPC UA", level: "了解" },
      { name: "能源管理", level: "熟练" },
      { name: "碳管理", level: "实战" },
    ],
  },
  {
    title: "AI 应用",
    gradient: "from-fuchsia-500 to-purple-500",
    skills: [
      { name: "LangChain", level: "实战" },
      { name: "RAG", level: "实战" },
      { name: "Qdrant", level: "实战" },
      { name: "Agent", level: "了解" },
      { name: "Embedding 模型", level: "实战" },
      { name: "Prompt 工程", level: "实战" },
    ],
  },
  {
    title: "小程序",
    gradient: "from-sky-500 to-indigo-500",
    skills: [
      { name: "unibest", level: "熟练" },
      { name: "uniapp", level: "熟练" },
      { name: "微信小程序", level: "实战" },
    ],
  },
];

const levelStyle = {
  熟练: "ring-1 ring-current",
  实战: "opacity-90",
  了解: "opacity-60 border-dashed",
};

export function SkillMatrix() {
  return (
    <div className="space-y-8">
      {groups.map((g, i) => (
        <motion.div
          key={g.title}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`h-6 w-1 rounded-full bg-gradient-to-b ${g.gradient}`}
            />
            <h3 className="font-semibold">{g.title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {g.skills.map((s) => (
              <span
                key={s.name}
                className={`inline-flex items-center text-xs rounded-lg px-2.5 py-1 border border-border/60 bg-card hover:scale-105 transition-transform ${levelStyle[s.level]}`}
                title={s.level}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${g.gradient} mr-1.5`}
                />
                {s.name}
                <span className="ml-1.5 text-[10px] text-muted">{s.level}</span>
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
