import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-32 flex flex-col items-center text-center">
      {/* 大号 404 */}
      <div className="relative mb-8 select-none">
        <span className="text-[8rem] md:text-[10rem] font-bold leading-none text-gradient-brand opacity-20">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="h-16 w-16 text-brand/60" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
        页面<span className="text-gradient-brand">找不到</span>了
      </h1>
      <p className="text-muted max-w-sm mb-10">
        这个页面已经不存在，或者链接写错了。老王也不知道它去哪了。
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Home className="h-4 w-4" />
          回首页
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-6 py-3 text-sm font-medium hover:border-brand/60 hover:text-brand backdrop-blur-md transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          去博客看看
        </Link>
      </div>
    </Container>
  );
}
