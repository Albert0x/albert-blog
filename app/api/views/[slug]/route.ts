import { getViews, recordView, isViewsConfigured } from "@/lib/views";
import {
  rateLimit,
  getClientIp,
  isOriginAllowed,
} from "@/lib/ai/rate-limit";

// 老王说明：浏览量接口
//   GET  /api/views/[slug] - 读取当前浏览量
//   POST /api/views/[slug] - 上报一次浏览（同 IP 24h 内只计 1 次）
//
// 防刷防线：
//   1. Origin 校验（拒绝第三方调用）
//   2. 速率限制（每 IP 三级，复用 ai/rate-limit）
//   3. Redis 端 24h IP+slug 原子去重（SET NX EX）

// ===== GET：读取浏览量 =====
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isViewsConfigured()) {
    return Response.json({ count: 0, configured: false });
  }
  const count = await getViews(slug);
  return Response.json({ count, configured: true });
}

// ===== POST：上报一次浏览 =====
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isViewsConfigured()) {
    return Response.json(
      { error: "NOT_CONFIGURED", count: 0 },
      { status: 503 }
    );
  }

  // 防线 1：Origin 校验
  if (!isOriginAllowed(req)) {
    return Response.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  // 防线 2：速率限制
  const ip = getClientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return Response.json(
      { error: "RATE_LIMITED", message: limit.reason },
      {
        status: 429,
        headers: limit.retryAfterSec
          ? { "Retry-After": String(limit.retryAfterSec) }
          : undefined,
      }
    );
  }

  // 防线 3：Redis 端 IP+slug 24h 原子去重
  const result = await recordView(slug, ip);
  return Response.json({
    count: result.count,
    counted: result.counted,
  });
}
