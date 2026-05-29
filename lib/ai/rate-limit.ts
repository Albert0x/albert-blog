// 老王说明：AI 接口速率限制 + 来源校验
//
// 双层实现，自动降级：
//   - 优先用 Upstash Redis（跨实例共享、持久化、Serverless 友好）
//   - Redis 未配置时降级到内存版（单实例、冷启动会清零）
//
// 设计要点：
//   - 三级窗口：每分钟 / 每小时 / 每天，固定窗口（不是滑动窗口，YAGNI 够用）
//   - 全站日配额：拦住"换 IP 刷"分布式攻击
//   - INCR + EXPIRE NX：原子计数 + 首次设过期，零 race condition
//   - 拒绝请求也算计数：被刷 = 拒得更久（类似指数退避效果）

import { Redis } from "@upstash/redis";

interface RateLimitResult {
  ok: boolean;
  reason?: string;
  retryAfterSec?: number;
}

// 限制规则（可按需调整）
const LIMITS = {
  perMinute: { windowSec: 60, max: 10 },
  perHour: { windowSec: 3_600, max: 60 },
  perDay: { windowSec: 86_400, max: 200 },
} as const;

// 全站每日总配额 - 防"换 IP 刷"分布式攻击
const GLOBAL_DAILY_LIMIT = 500;
const GLOBAL_KEY = "rl:global:d";

// ===== Redis 初始化（与 lib/views.ts 共用同一份配置）=====
const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";

const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

// ============ Redis 版限流（首选） ============

// 老王说明：原子 INCR + 首次设过期
// 用 pipeline 一次往返完成所有命令，性能最优
async function incrWithTtl(
  pipe: ReturnType<Redis["pipeline"]>,
  key: string,
  ttlSec: number
) {
  pipe.incr(key);
  // NX = 只在 key 没有 TTL 时设置；避免后续 INCR 把窗口"续期"
  pipe.expire(key, ttlSec, "NX");
}

async function rateLimitRedis(ip: string): Promise<RateLimitResult> {
  if (!redis) throw new Error("REDIS_NOT_INITIALIZED");

  const minKey = `rl:${ip}:m`;
  const hourKey = `rl:${ip}:h`;
  const dayKey = `rl:${ip}:d`;

  const pipe = redis.pipeline();
  await incrWithTtl(pipe, minKey, LIMITS.perMinute.windowSec);
  await incrWithTtl(pipe, hourKey, LIMITS.perHour.windowSec);
  await incrWithTtl(pipe, dayKey, LIMITS.perDay.windowSec);
  await incrWithTtl(pipe, GLOBAL_KEY, LIMITS.perDay.windowSec);

  const results = (await pipe.exec()) as (number | "OK" | 0 | 1)[];
  // results 顺序：[minIncr, minExpire, hourIncr, hourExpire, dayIncr, dayExpire, globalIncr, globalExpire]
  const minCount = Number(results[0]);
  const hourCount = Number(results[2]);
  const dayCount = Number(results[4]);
  const globalCount = Number(results[6]);

  // 老王说明：检查顺序按"配额从大到小"，给出最准确的 retry-after
  if (globalCount > GLOBAL_DAILY_LIMIT) {
    return {
      ok: false,
      reason: "今日 AI 助手请求量已达全站上限，明天再来聊。",
      retryAfterSec: LIMITS.perDay.windowSec,
    };
  }
  if (dayCount > LIMITS.perDay.max) {
    return {
      ok: false,
      reason: "今日提问次数已达上限，请明天再来聊聊。",
      retryAfterSec: LIMITS.perDay.windowSec,
    };
  }
  if (hourCount > LIMITS.perHour.max) {
    return {
      ok: false,
      reason: "1 小时内提问太多，请稍后再试。",
      retryAfterSec: LIMITS.perHour.windowSec,
    };
  }
  if (minCount > LIMITS.perMinute.max) {
    return {
      ok: false,
      reason: "提问太快，喘口气，10 秒后再来。",
      retryAfterSec: 10,
    };
  }

  return { ok: true };
}

// ============ 内存版限流（fallback，Redis 未配置时用） ============

const buckets = new Map<string, number[]>();
let globalDailyCount = 0;
let globalDailyResetAt = Date.now() + 86_400_000;

function gcBuckets() {
  const now = Date.now();
  const dayMs = LIMITS.perDay.windowSec * 1000;
  for (const [ip, timestamps] of buckets.entries()) {
    const fresh = timestamps.filter((t) => now - t < dayMs);
    if (fresh.length === 0) buckets.delete(ip);
    else buckets.set(ip, fresh);
  }
}

function rateLimitMemory(ip: string): RateLimitResult {
  const now = Date.now();

  if (now > globalDailyResetAt) {
    globalDailyCount = 0;
    globalDailyResetAt = now + 86_400_000;
  }
  if (globalDailyCount >= GLOBAL_DAILY_LIMIT) {
    return {
      ok: false,
      reason: "今日 AI 助手请求量已达全站上限，明天再来聊。",
      retryAfterSec: Math.ceil((globalDailyResetAt - now) / 1000),
    };
  }

  const arr = buckets.get(ip) ?? [];
  const dayMs = LIMITS.perDay.windowSec * 1000;
  const fresh = arr.filter((t) => now - t < dayMs);

  if (fresh.length >= LIMITS.perDay.max) {
    return {
      ok: false,
      reason: "今日提问次数已达上限，请明天再来聊聊。",
      retryAfterSec: LIMITS.perDay.windowSec,
    };
  }
  const recentHour = fresh.filter(
    (t) => now - t < LIMITS.perHour.windowSec * 1000
  );
  if (recentHour.length >= LIMITS.perHour.max) {
    return {
      ok: false,
      reason: "1 小时内提问太多，请稍后再试。",
      retryAfterSec: LIMITS.perHour.windowSec,
    };
  }
  const recentMinute = fresh.filter(
    (t) => now - t < LIMITS.perMinute.windowSec * 1000
  );
  if (recentMinute.length >= LIMITS.perMinute.max) {
    return {
      ok: false,
      reason: "提问太快，喘口气，10 秒后再来。",
      retryAfterSec: 10,
    };
  }

  fresh.push(now);
  buckets.set(ip, fresh);
  globalDailyCount++;

  if (Math.random() < 0.01) gcBuckets();

  return { ok: true };
}

// ============ 对外统一入口 ============

/**
 * 检查并扣除一次配额。返回 ok=true 放行；ok=false 超限
 *
 * 优先走 Redis；Redis 异常自动降级到内存版（保证服务不挂）
 */
export async function rateLimit(ip: string): Promise<RateLimitResult> {
  if (redis) {
    try {
      return await rateLimitRedis(ip);
    } catch (err) {
      // 老王说明：Redis 异常时降级，不让限流故障导致接口挂掉
      console.error("[rate-limit] Redis failed, fallback to memory:", err);
      return rateLimitMemory(ip);
    }
  }
  return rateLimitMemory(ip);
}

/** 当前限流后端（用于诊断） */
export function getRateLimitBackend(): "redis" | "memory" {
  return redis ? "redis" : "memory";
}

/**
 * 提取访客 IP - 兼容 Vercel / Node / 本地 dev
 * 老王说明：x-forwarded-for 可能是逗号分隔的链路，取第一个
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/**
 * 校验请求来源 - 防止别人直接 curl 你的接口
 * 生产环境强校验，开发环境放行（方便调试）
 */
export function isOriginAllowed(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  const allowed = [
    "https://albert0x.vercel.app",
    "https://albert-blog-", // Vercel 预览部署的域名前缀
  ];

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowed.push(process.env.NEXT_PUBLIC_SITE_URL);
  }

  return allowed.some(
    (a) => origin.startsWith(a) || referer.startsWith(a)
  );
}
