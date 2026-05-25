import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Container } from "@/components/ui/Container";

// 老王说明：站点底部，社交链接 + 版权
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60">
      <Container size="wide">
        <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted">
            © {year}{" "}
            <span className="text-gradient-brand font-semibold">
              {siteConfig.name}
            </span>{" "}
            · 把代码写进车间，把 AI 带入工厂
          </div>
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${siteConfig.author.email}`}
              className="grid h-9 w-9 place-items-center rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Link
              href="/feed.xml"
              className="ml-2 text-xs text-muted hover:text-foreground transition-colors"
            >
              RSS
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
