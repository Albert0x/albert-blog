"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, FileText, CornerDownLeft } from "lucide-react";

// 老王说明：站内搜索弹窗
// - 全局 Ctrl/Cmd+K 快捷键打开
// - Esc 关闭
// - ↑↓ 选择结果，Enter 跳转
// - 300ms debounce 防止每次按键都打 API
// - 命中关键词高亮（简易实现，不引第三方）

interface Hit {
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  excerpt: string;
  score: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// 老王说明：把命中关键词包装成 <mark>
function highlight(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  // 拿前 2 个字符做高亮（中文 2-gram，足够覆盖大多数命中）
  const token = query.trim().slice(0, 8);
  if (!token) return text;

  const parts = text.split(new RegExp(`(${escapeRegex(token)})`, "i"));
  return parts.map((part, i) =>
    part.toLowerCase() === token.toLowerCase() ? (
      <mark
        key={i}
        className="bg-brand/20 text-brand font-medium rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function SearchDialog({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 老王说明：打开时聚焦 + 清空
  useEffect(() => {
    if (open) {
      setQuery("");
      setHits([]);
      setActiveIdx(0);
      // 等 transition 结束再聚焦，避免动画抢焦
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 老王说明：debounce 调 API
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&limit=8`
          );
          if (!res.ok) {
            setHits([]);
            return;
          }
          const data = (await res.json()) as { hits: Hit[] };
          setHits(data.hits ?? []);
          setActiveIdx(0);
        } catch {
          setHits([]);
        }
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  // 老王说明：键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, hits.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && hits[activeIdx]) {
        e.preventDefault();
        router.push(`/blog/${hits[activeIdx].slug}`);
        onClose();
      }
    },
    [hits, activeIdx, router, onClose]
  );

  // 老王说明：选中项滚动到视口内
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      `[data-idx="${activeIdx}"]`
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const placeholder = useMemo(
    () => "搜索文章标题、分类、内容…",
    []
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="站内搜索"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          {isPending ? (
            <Loader2 className="h-5 w-5 text-muted animate-spin shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-muted shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted/60"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center h-7 w-7 rounded-md text-muted hover:bg-foreground/5"
            aria-label="关闭搜索"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 结果列表 / 空态 */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto"
          role="listbox"
        >
          {/* 没输入 */}
          {!query.trim() && (
            <div className="px-4 py-10 text-center text-sm text-muted">
              <Search className="h-8 w-8 mx-auto text-muted/30 mb-2" />
              <p>输入关键词搜索博客文章</p>
              <p className="mt-1 text-xs text-muted/70">
                支持中文 / 英文 / 混合搜索
              </p>
            </div>
          )}

          {/* 有输入但无结果 */}
          {query.trim() && !isPending && hits.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted">
              <p>
                没找到「
                <span className="text-foreground font-medium">{query}</span>
                」相关的文章
              </p>
              <p className="mt-1 text-xs text-muted/70">
                换个关键词试试，或者去博客首页浏览全部
              </p>
            </div>
          )}

          {/* 结果列表 */}
          {hits.length > 0 && (
            <div className="py-2">
              {hits.map((h, i) => (
                <button
                  type="button"
                  key={h.slug}
                  data-idx={i}
                  onClick={() => {
                    router.push(`/blog/${h.slug}`);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`group w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${
                    i === activeIdx
                      ? "bg-gradient-brand-soft"
                      : "hover:bg-foreground/5"
                  }`}
                  role="option"
                  aria-selected={i === activeIdx}
                >
                  <div
                    className={`grid place-items-center h-8 w-8 rounded-md shrink-0 ${
                      i === activeIdx
                        ? "bg-brand/20 text-brand"
                        : "bg-foreground/5 text-muted"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] inline-flex items-center rounded-full bg-gradient-brand-soft px-1.5 py-0.5 text-brand font-medium">
                        {h.category}
                      </span>
                      <span className="text-[10px] text-muted">{h.date}</span>
                    </div>
                    <h4
                      className={`text-sm font-medium truncate ${
                        i === activeIdx ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {highlight(h.title, query)}
                    </h4>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {highlight(h.excerpt, query)}
                    </p>
                  </div>
                  {i === activeIdx && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部快捷键提示 */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-t border-border/60 bg-foreground/[0.02] text-[10px] text-muted/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono">
                ↑↓
              </kbd>
              选择
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono">
                ↵
              </kbd>
              打开
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono">
                Esc
              </kbd>
              关闭
            </span>
          </div>
          <span>
            {hits.length > 0 && `${hits.length} 个结果`}
          </span>
        </div>
      </div>
    </div>
  );
}
