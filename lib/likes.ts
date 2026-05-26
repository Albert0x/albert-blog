import { Redis } from "@upstash/redis";

// 老王说明：点赞数据存储层 - 基于 Upstash Redis
// 兼容两种环境变量命名（Vercel 老的 KV 集成 + 新的 Marketplace Redis）：
//   - KV_REST_API_URL / KV_REST_API_TOKEN     ← Vercel KV 老集成自动注入
//   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN ← 新 Marketplace 集成
//
// 本地开发：
//   1. 去 Vercel 项目 → Storage → Create Database → Upstash Redis（免费）
//   2. 创建后，自动注入 env vars 到 production
//   3. 本地拉环境变量：`vercel env pull .env.local`
//   4. 或者手动复制 Upstash 的 URL/Token 到 .env.local
const REDIS_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  "";
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";

// 老王说明：没配置环境变量时不要 throw，让上层兜底降级
// （未配置时点赞功能自动隐藏，不影响博客其他功能）
const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

// 检测是否配置了 KV（API 路由用来判断是否降级）
export function isKvConfigured(): boolean {
  return redis !== null;
}

// 老王说明：key 命名规范统一在这里，方便未来重命名或迁移
const likeKey = (slug: string) => `like:${slug}`;

// 读取某篇文章的点赞数
export async function getLikes(slug: string): Promise<number> {
  if (!redis) return 0;
  try {
    const count = await redis.get<number>(likeKey(slug));
    return count ?? 0;
  } catch (err) {
    console.error("[likes] getLikes failed:", err);
    return 0;
  }
}

// 给某篇文章点赞 +1，返回新的点赞数
export async function incrementLikes(slug: string): Promise<number> {
  if (!redis) {
    throw new Error("KV_NOT_CONFIGURED");
  }
  return await redis.incr(likeKey(slug));
}

// 批量读取多篇文章的点赞数（给列表页用，一次拿完比多次请求快）
export async function getLikesBatch(
  slugs: string[]
): Promise<Record<string, number>> {
  if (!redis || slugs.length === 0) {
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }
  try {
    const keys = slugs.map(likeKey);
    const counts = await redis.mget<(number | null)[]>(...keys);
    return Object.fromEntries(
      slugs.map((s, i) => [s, counts[i] ?? 0])
    );
  } catch (err) {
    console.error("[likes] getLikesBatch failed:", err);
    return Object.fromEntries(slugs.map((s) => [s, 0]));
  }
}
