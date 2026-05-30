"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

// 老王说明：磁性按钮 - 鼠标靠近时按钮轻微「吸」向光标
// - 包一个 Next Link，移动端/触屏不生效（无 hover）
// - 用 transform 平移，离开时回弹归位
// - strength 控制吸附幅度
interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  href,
  children,
  className,
  strength = 0.4,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{ transition: "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)" }}
    >
      {children}
    </Link>
  );
}
