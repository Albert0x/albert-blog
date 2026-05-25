import type { Metadata } from "next";
import { MessageSquare, Github, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GiscusComments } from "@/components/comments/Giscus";
import { siteConfig } from "@/lib/site-config";

// 老王说明：留言板页面（基于 Giscus / GitHub Discussions）
// 所有留言聚到同一个 Issue（term="guestbook"），永久免费、零运维
export const metadata: Metadata = {
  title: "留言板",
  description: "在这里给 Albert 留个言，聊聊技术、合作或者随便扯扯淡。",
};

export default function GuestbookPage() {
  return (
    <Container size="default" className="py-16">
      {/* 标题区 */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient-brand">留言板</span>
        </h1>
        <p className="mt-3 text-muted max-w-2xl">
          有任何想聊的，留个言。需要 GitHub 账号登录，但请文明发言。
        </p>
      </header>

      {/* 说明卡片 */}
      <div className="mb-10 grid sm:grid-cols-3 gap-4">
        <InfoCard
          icon={<Github className="h-5 w-5" />}
          gradient="from-zinc-700 to-zinc-900"
          title="GitHub 登录"
          desc="留言数据存于 GitHub Discussions，登录即可发言。"
        />
        <InfoCard
          icon={<MessageSquare className="h-5 w-5" />}
          gradient="from-indigo-500 to-violet-500"
          title="支持 Markdown"
          desc="代码块、链接、引用全支持，技术讨论顺手就来。"
        />
        <InfoCard
          icon={<Heart className="h-5 w-5" />}
          gradient="from-rose-500 to-fuchsia-500"
          title="表情反应"
          desc="不想打字？给一个 👍 ❤️ 🎉 也行。"
        />
      </div>

      {/* Giscus 留言区 - 用 specific term 让所有留言聚到同一个 Issue */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
        <GiscusComments mapping="specific" term={siteConfig.giscus.guestbookTerm} />
      </div>
    </Container>
  );
}

// 老王说明：信息卡片小组件，KISS 内联
function InfoCard({
  icon,
  gradient,
  title,
  desc,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md mb-3`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
