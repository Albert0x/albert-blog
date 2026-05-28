import { Container } from "@/components/ui/Container";

// 老王说明：全局 loading.tsx - 路由切换时 Next.js 自动展示
// 用 pulse 动画骨架屏，比转圈圈体验好
export default function Loading() {
  return (
    <Container size="wide" className="py-16">
      {/* 标题骨架 */}
      <div className="mb-10">
        <div className="h-10 w-48 rounded-lg bg-foreground/8 animate-pulse mb-3" />
        <div className="h-4 w-72 rounded bg-foreground/5 animate-pulse" />
      </div>

      {/* 卡片骨架 grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/40 bg-card p-6 space-y-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 rounded-full bg-foreground/8 animate-pulse" />
              <div className="h-4 w-14 rounded-full bg-foreground/5 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-4/5 rounded bg-foreground/8 animate-pulse" />
              <div className="h-4 w-full rounded bg-foreground/5 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-foreground/5 animate-pulse" />
            </div>
            <div className="flex gap-2 pt-2">
              {[40, 52, 36].map((w) => (
                <div
                  key={w}
                  className="h-5 rounded bg-foreground/5 animate-pulse"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
