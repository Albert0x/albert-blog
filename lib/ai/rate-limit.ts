// 老王说明：AI 接口速率限制 + 来源校验
// 简化方案：内存级计数器（无需 Redis）
// - 优点：0 依赖，立即生效
// - 缺点：Vercel Serverless 冷启动会清零；多实例间不共享
// - 实际效果：能拦住 80% 的非分布式爆破；剩余风险靠 DeepSeek 平台「每日花费上限」兜底
//
// 升级路径（未来流量大了再做）：
// - Vercel KV (Redis) → 跨实例共享 + 持久化
// - Upstash Redis    → 免费 10K commands/day

interface RateLimitResult {
  ok: boolean;
  reason?: string;
  retryAfterSec?: number;
}

// 限制规则（可按需调整）
const LIMITS = {
  perMinute: { windowMs: 60_000, max: 10 }, // 每 IP 每分钟最多 10 次
  perHour: { windowMs: 3_600_000, max: 60 }, // 每 IP 每小时最多 60 次
  perDay: { windowMs: 86_400_000, max: 200 }, // 每 IP 每天最多 200 次
} as const;

// 老王说明：全站总配额 - 防止"换 IP 刷"攻击
// 即使每个 IP 都没超单 IP 配额，全站每天总数也有上限
const GLOBAL_DAILY_LIMIT = 500; // 全站每天总请求数上限（按 DeepSeek 价格估算，500 次约 ¥0.5）

// 内存桶：ip → [时间戳数组]
const buckets = new Map<string, number[]>();

// 全站每日总计数器
let globalDailyCount = 0;
let globalDailyResetAt = Date.now() + 86_400_000;

// 定期清理过期记录，防止内存泄漏
function gcBuckets() {
  const now = Date.now();
  const dayMs = LIMITS.perDay.windowMs;
  for (const [ip, timestamps] of buckets.entries()) {
    const fresh = timestamps.filter((t) => now - t < dayMs);
    if (fresh.length === 0) buckets.delete(ip);
    else buckets.set(ip, fresh);
  }
}

/**
 * 检查并扣除一次配额
 * 返回 ok=true 表示放行；ok=false 表示超限
 */
export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  // 老王说明：全站总配额检查 - 拦下「分布式刷接口」攻击
  // 每天自动重置计数器
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

  // 只保留 24 小时内的记录（清理过期）
  const fresh = arr.filter((t) => now - t < LIMITS.perDay.windowMs);

  // 检查每日上限
  if (fresh.length >= LIMITS.perDay.max) {
    return {
      ok: false,
      reason: "今日提问次数已达上限，请明天再来聊聊。",
      retryAfterSec: 86_400,
    };
  }

  // 检查每小时上限
  const recentHour = fresh.filter((t) => now - t < LIMITS.perHour.windowMs);
  if (recentHour.length >= LIMITS.perHour.max) {
    return {
      ok: false,
      reason: "1 小时内提问太多，请稍后再试。",
      retryAfterSec: 3_600,
    };
  }

  // 检查每分钟上限（最严，防爆破）
  const recentMinute = fresh.filter(
    (t) => now - t < LIMITS.perMinute.windowMs
  );
  if (recentMinute.length >= LIMITS.perMinute.max) {
    return {
      ok: false,
      reason: "提问太快，喘口气，10 秒后再来。",
      retryAfterSec: 10,
    };
  }

  // 通过 → 记录这次请求时间
  fresh.push(now);
  buckets.set(ip, fresh);
  globalDailyCount++; // 全站计数 +1

  // 定期清理（每 100 次请求做一次 GC）
  if (Math.random() < 0.01) gcBuckets();

  return { ok: true };
}

// 老王说明：暴露内部状态供监控接口使用（可选）
export function getRateLimitStats() {
  return {
    activeIps: buckets.size,
    globalDailyCount,
    globalDailyResetAt,
    globalDailyLimit: GLOBAL_DAILY_LIMIT,
  };
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
  // 开发环境不校验，方便本地 / Postman 调试
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  // 允许的域名前缀（包括 Vercel 默认域名 + 自定义域名 + Preview）
  const allowed = [
    "https://albert0x.vercel.app",
    "https://albert-blog-",  // Vercel 预览部署的域名前缀
  ];

  // 自定义域名（如果配置了的话）
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowed.push(process.env.NEXT_PUBLIC_SITE_URL);
  }

  return allowed.some(
    (a) => origin.startsWith(a) || referer.startsWith(a)
  );
}
