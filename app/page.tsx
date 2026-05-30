import Link from "next/link";
import { ArrowRight, Sparkles, Factory, Code2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroSceneClient } from "@/components/three/HeroSceneClient";
import { AnimatedSection } from "@/components/home/AnimatedSection";
import { AnimatedHeadline } from "@/components/home/AnimatedHeadline";
import { CursorSpotlight } from "@/components/home/CursorSpotlight";
import { PostCard } from "@/components/blog/PostCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/mdx";
import { getViewsBatch } from "@/lib/views";
import { projects } from "@/lib/projects";

// 老王说明：首页（Server Component）
// 结构：3D Hero → 三大方向 → 最新文章 → 精选项目 → 行动召唤
// Three.js 通过 Client Component + dynamic import 接入，零 SSR 包体污染
//
// ISR：每 60 秒后台静默重生成，让"最新文章"卡片浏览量保持新鲜
export const revalidate = 60;

const pillarIcons = { Factory, Sparkles, Code2 } as const;

export default async function Home() {
  const latestPosts = getAllPosts().slice(0, 3);
  const featuredProjects = projects.slice(0, 3);
  // 老王说明：批量拿最新 3 篇浏览量
  const viewsMap = await getViewsBatch(latestPosts.map((p) => p.slug));

  return (
    <>
      {/* 鼠标聚光灯（跟随光标的柔光，触屏/减少动效自动关闭） */}
      <CursorSpotlight />

      {/* ============== Hero 区（带 Three.js 3D 背景） ============== */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        {/* 3D 背景 */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <HeroSceneClient />
          {/* 顶部/底部柔化遮罩，让 3D 不抢内容 */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
        </div>

        <Container className="py-24 md:py-32 relative">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              工业互联网 × AI 应用 × 全栈工程
            </span>

            <AnimatedHeadline prefix="你好，我是" name={siteConfig.name} />

            <p className="max-w-2xl text-lg md:text-xl text-muted text-balance leading-relaxed">
              把代码写进车间，把 <span className="text-foreground font-medium">AI</span> 带入工厂。
              <br className="hidden sm:block" />
              用全栈视角解决工业现场的真实问题。
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton
                href="/blog"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 transition-shadow"
              >
                浏览文章
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton
                href="/projects"
                strength={0.3}
                className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/60 px-6 py-3 text-sm font-medium hover:border-brand/60 hover:text-brand backdrop-blur-md transition-colors"
              >
                看看项目
              </MagneticButton>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-muted hover:text-brand transition-all"
              >
                了解我 →
              </Link>
            </div>
          </div>
        </Container>

        {/* 滚动提示 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted/60 animate-bounce">
          ↓ 继续探索
        </div>
      </section>

      {/* ============== 三大方向 ============== */}
      <section className="py-20 md:py-28 relative">
        <Container size="wide">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              在 <span className="text-gradient-brand">三个方向</span> 上持续深耕
            </h2>
            <p className="mt-3 text-muted">三股力量交汇处，就是我的差异化优势。</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {siteConfig.pillars.map((p, i) => {
              const Icon = pillarIcons[p.icon as keyof typeof pillarIcons];
              return (
                <AnimatedSection key={p.title} delay={i * 0.1}>
                  <div className="card-hover relative rounded-2xl border border-border/60 bg-card p-7 overflow-hidden h-full">
                    <div
                      className={`absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${p.gradient} opacity-20 blur-2xl`}
                    />
                    <div
                      className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} text-white shadow-lg mb-4`}
                    >
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============== 最新文章 ============== */}
      {latestPosts.length > 0 && (
        <section className="py-20 md:py-28 relative bg-gradient-to-b from-transparent via-card/30 to-transparent">
          <Container size="wide">
            <AnimatedSection>
              <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    最新 <span className="text-gradient-brand">文章</span>
                  </h2>
                  <p className="mt-2 text-muted">把踩过的坑写成笔记，把思考变成沉淀。</p>
                </div>
                <Link
                  href="/blog"
                  className="text-sm text-brand hover:underline inline-flex items-center gap-1"
                >
                  查看全部 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((p, i) => (
                <AnimatedSection key={p.slug} delay={i * 0.08}>
                  <PostCard post={p} views={viewsMap[p.slug]} />
                </AnimatedSection>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ============== 精选项目 ============== */}
      <section className="py-20 md:py-28 relative">
        <Container size="wide">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  精选 <span className="text-gradient-brand">项目</span>
                </h2>
                <p className="mt-2 text-muted">围绕工业互联网与 AI 应用方向的学习与实践记录。</p>
              </div>
              <Link
                href="/projects"
                className="text-sm text-brand hover:underline inline-flex items-center gap-1"
              >
                查看全部 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* ============== 行动召唤 ============== */}
      <section className="py-20 md:py-28 relative">
        <Container size="default">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-brand-soft p-10 md:p-14 text-center">
              <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-gradient-brand opacity-30 blur-3xl animate-float-slow" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-accent opacity-30 blur-3xl animate-float-slow" />

              <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight mb-4">
                想聊聊 <span className="text-gradient-brand">工业 + AI</span> 吗？
              </h2>
              <p className="relative text-muted max-w-xl mx-auto mb-8">
                无论是合作机会、技术交流，还是单纯想吐槽工业项目里的奇葩需求，都欢迎找我聊聊。
              </p>
              <div className="relative flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5 transition-all"
                >
                  联系我 <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/guestbook"
                  className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/60 px-6 py-3 text-sm font-medium hover:border-brand/60 hover:text-brand backdrop-blur-md transition-all"
                >
                  去留言板
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
