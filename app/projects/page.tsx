"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects, getAllDomains } from "@/lib/projects";

// 老王说明：项目列表页
// 客户端组件原因：技术栈筛选需要交互状态
// 注：metadata 由根 layout 处理；此页面 SEO 元信息后续可拆 Server Component 包一层
export default function ProjectsPage() {
  const domains = getAllDomains();
  const [selectedDomain, setSelectedDomain] = useState<string>("全部");

  const filtered = useMemo(() => {
    if (selectedDomain === "全部") return projects;
    return projects.filter((p) => p.domain === selectedDomain);
  }, [selectedDomain]);

  return (
    <Container size="wide" className="py-16">
      {/* 标题区 */}
      <header className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          <span className="text-gradient-brand">项目集</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-3 text-muted max-w-2xl"
        >
          这些项目是我的学习与实践记录，覆盖工业互联网、AI 应用、全栈工程等多个方向。
        </motion.p>
      </header>

      {/* 领域筛选 */}
      <div className="mb-10 flex flex-wrap gap-2">
        <FilterChip
          label={`全部 · ${projects.length}`}
          active={selectedDomain === "全部"}
          onClick={() => setSelectedDomain("全部")}
        />
        {domains.map((d) => {
          const count = projects.filter((p) => p.domain === d).length;
          return (
            <FilterChip
              key={d}
              label={`${d} · ${count}`}
              active={selectedDomain === d}
              onClick={() => setSelectedDomain(d)}
            />
          );
        })}
      </div>

      {/* 项目卡片网格 */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          这个方向暂时还没有公开项目。
        </div>
      )}
    </Container>
  );
}

// 老王说明：筛选 chip，提取出来避免 JSX 啰嗦
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-medium text-white shadow-md shadow-brand/20"
          : "inline-flex items-center rounded-full border border-border/60 px-4 py-1.5 text-xs text-muted hover:border-brand/60 hover:text-brand transition-colors"
      }
    >
      {label}
    </button>
  );
}
