import { Redis } from "@upstash/redis";

// 老王说明：浏览量数据存储层 - 基于 Upstash Redis
// 设计思路跟 lib/likes.ts 一致，DRY 原则复用同一份 Redis 配置
// 主要区别：
//   - key 命名空间用 view: 前缀，跟 like: 隔离
//   - 提供 dedup key（24h 内同 IP 去重），防止刷量
const REDIS_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  "";
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";

const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

export function isViewsConfigured(): boolean {
  return redis !== null;
}

// 老王说明：key 命名规范
const viewKey = (slug: string) => `view:${slug}`;
const dedupKey = (slug: string, ip: string) => `view:dedup:${slug}:${ip}`;

// 老王说明：同 IP+slug 24h 去重窗口
const DEDUP_WINDOW_SECONDS = 24 * 60 * 60;

// 读取某篇文章的浏览量
export async function getViews(slug: string): Promise<number> {
  if (!redis) return 0;
  try {
    const count = await redis.get<number>(viewKey(slug));
    return count ?? 0;
  } catch (err) {
    console.error("[views] getViews failed:", err);
    return 0;
  }
}

// 老王说明：上报浏览（带去重）
// 返回 { count, counted: boolean } - counted=true 表示这次实际计数了
// 实现：用 SET NX EX 原子操作设置去重 key，成功才 INCR
export async function recordView(
  slug: string,
  ip: string
): Promise<{ count: number; counted: boolean }> {
  if (!redis) {
    return { count: 0, counted: false };
  }
  try {
    // 老王说明：SET NX EX = "如果 key 不存在则设置并设过期"，是原子操作
    // 防并发同一 IP 多次刷新瞬间多次计数
    const setResult = await redis.set(dedupKey(slug, ip), "1", {
      nx: true,
      ex: DEDUP_WINDOW_SECONDS,
    });
    if (setResult !== "OK") {
      // 24h 内已计过，只返回当前数
      const count = await getViews(slug);
      return { count, counted: false };
    }
    const count = await redis.incr(viewKey(slug));
    return { count, counted: true };
  } catch (err) {
    console.error("[views] recordView failed:", err);
    return { count: 0, counted: false };
  }
}

// 老王说明：批量读取多篇浏览量（列表页用，一次 mget 比多次 get 快）
export async function getViewsBatch(
  slugs: string[]
): Promise<Record<string, number>> {
  if (!redis || slugs.length === 0) {
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }
  try {
    const keys = slugs.map(viewKey);
    const counts = await redis.mget<(number | null)[]>(...keys);
    return Object.fromEntries(slugs.map((s, i) => [s, counts[i] ?? 0]));
  } catch (err) {
    console.error("[views] getViewsBatch failed:", err);
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }
}
