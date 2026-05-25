"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ExternalLink, FileText, Target, Zap, TrendingUp } from "lucide-react";
import type { Project } from "@/lib/projects";

// 老王说明：项目卡片
// - 3D 倾斜悬浮（mouse-tracked tilt）让卡片活起来
// - 顶部渐变条 + 状态徽章
// - 业务痛点 / 技术亮点 / 业绩指标 三段式信息
const statusColor: Record<Project["status"], string> = {
  实践中: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  迭代中: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  已完成: "bg-sky-500/10 text-sky-500 border-sky-500/30",
  探索中: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30",
};

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col"
    >
      {/* 顶部渐变条 */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${project.gradient}`} />

      {/* 背景光晕（hover 出现） */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br ${project.gradient} opacity-20 blur-3xl`} />
      </div>

      <div className="relative p-6 flex flex-col flex-1">
        {/* 顶部：领域 + 状态 */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${project.gradient} px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm`}>
            {project.domain}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${statusColor[project.status]}`}>
            ● {project.status}
          </span>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-semibold leading-snug mb-2">{project.title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-5 line-clamp-2">
          {project.description}
        </p>

        {/* 三段式信息 */}
        <div className="space-y-2.5 mb-5 text-xs">
          <div className="flex gap-2">
            <Target className="h-3.5 w-3.5 mt-0.5 text-rose-500 shrink-0" />
            <span className="text-muted">
              <span className="text-foreground/80 font-medium">痛点：</span>
              {project.painPoint}
            </span>
          </div>
          <div className="flex gap-2">
            <Zap className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
            <span className="text-muted">
              <span className="text-foreground/80 font-medium">亮点：</span>
              {project.highlight}
            </span>
          </div>
          {project.metrics && project.metrics.length > 0 && (
            <div className="flex gap-2">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
              <div className="text-muted">
                <span className="text-foreground/80 font-medium">数据：</span>
                <ul className="inline">
                  {project.metrics.map((m, i) => (
                    <span key={m} className="inline">
                      {m}
                      {i < project.metrics!.length - 1 && <span className="text-border mx-1.5">·</span>}
                    </span>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 技术栈标签 */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.techStack.map((t) => (
            <span
              key={t}
              className="text-[10px] border border-border/60 bg-background/40 rounded px-1.5 py-0.5 text-muted hover:border-brand/50 hover:text-brand transition-colors"
            >
              {t}
            </span>
          ))}
        </div>

        {/* 底部链接 */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-4 text-xs">
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-brand transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          )}
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-brand transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Demo
            </a>
          )}
          {project.links?.article && (
            <Link
              href={`/blog/${project.links.article}`}
              className="inline-flex items-center gap-1 text-muted hover:text-brand transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> 相关文章
            </Link>
          )}
          {!project.links && (
            <span className="text-muted/50 italic">学习项目，暂未开源</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
