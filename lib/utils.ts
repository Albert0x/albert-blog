import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 老王说明：合并 Tailwind class 的标配工具，避免重复和冲突
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期：2026-05-22
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
