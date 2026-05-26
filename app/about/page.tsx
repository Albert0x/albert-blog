import type { Metadata } from "next";
import { Github, MapPin, Briefcase } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DomainMap } from "@/components/about/DomainMap";
import { SkillMatrix } from "@/components/about/SkillMatrix";
import { Timeline } from "@/components/about/Timeline";
import { siteConfig } from "@/lib/site-config";

// 老王说明：关于我页面
// 结构：自我介绍 → 领域地图 → 技术栈矩阵 → 经历时间线 → 联系我
export const metadata: Metadata = {
  title: "关于我",
  description: "Albert - 工业互联网 × AI 应用 × 全栈开发的复合型实践者。",
};

export default function AboutPage() {
  return (
    <Container size="default" className="py-16">
      {/* Hero 介绍区 */}
      <section className="mb-20">
        <div className="flex items-center gap-2 text-sm text-muted mb-3">
          <Briefcase className="h-4 w-4 text-brand" />
          全栈开发者 · 工业互联网实践者 · AI 应用探索者
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance leading-[1.15] mb-6">
          你好，我是
          <span className="text-gradient-brand"> {siteConfig.name}</span>
        </h1>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            一个对 <strong>工业互联网</strong> 和 <strong>AI 应用</strong>{" "}
            都感兴趣的全栈学习者，主力栈是 <strong>React + Python</strong>。
          </p>
          <p>
            我感兴趣的方向有点 <em>「不太主流」</em>： 把最传统的
            <strong>工业领域 know-how</strong>，和最前沿的{" "}
            <strong>大模型技术</strong>{" "}
            结合起来，研究知识查询、能耗管理、领域助手这类有意思的问题。
          </p>
          <p className="text-muted">这不是一份简历，是一段持续学习的记录。</p>
        </div>
      </section>

      {/* 领域地图 */}
      <section className="mb-20">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            我的 <span className="text-gradient-brand">领域地图</span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            三个方向并行推进，交集才是真正的差异化优势。
          </p>
        </header>
        <DomainMap />
      </section>

      {/* 技术栈矩阵 */}
      <section className="mb-20">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            技术栈 <span className="text-gradient-brand">矩阵</span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            分组展示，按熟练度划分：
            <span className="ml-2 text-xs">
              <span className="inline-block ring-1 ring-current rounded px-1.5 py-0.5 mr-1">
                熟练
              </span>
              <span className="inline-block opacity-90 border border-border/60 rounded px-1.5 py-0.5 mr-1">
                实战
              </span>
              <span className="inline-block opacity-60 border border-dashed border-border/60 rounded px-1.5 py-0.5">
                了解
              </span>
            </span>
          </p>
        </header>
        <SkillMatrix />
      </section>

      {/* 经历时间线 */}
      <section className="mb-20">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            成长 <span className="text-gradient-brand">时间线</span>
          </h2>
        </header>
        <Timeline />
      </section>

      {/* 联系方式 */}
      <section>
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            找到 <span className="text-gradient-brand">我</span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            合作 / 交流 / 找我聊技术，都欢迎。
          </p>
        </header>
        <div className="grid md:grid-cols-3 gap-4">
          {/* <a
            href={`mailto:${siteConfig.author.email}`}
            className="card-hover group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted">邮件</div>
              <div className="text-sm font-medium group-hover:text-brand transition-colors">
                {siteConfig.author.email}
              </div>
            </div>
          </a> */}
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-white">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted">GitHub</div>
              <div className="text-sm font-medium group-hover:text-brand transition-colors">
                @Albert0x
              </div>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted">所在地</div>
              <div className="text-sm font-medium">中国</div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
