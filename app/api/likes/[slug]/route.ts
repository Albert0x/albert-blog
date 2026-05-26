import { cookies } from "next/headers";
import {
  getLikes,
  incrementLikes,
  isKvConfigured,
} from "@/lib/likes";
import {
  rateLimit,
  getClientIp,
  isOriginAllowed,
} from "@/lib/ai/rate-limit";

// 老王说明：点赞接口 - 同 path 两个方法
//   GET  /api/likes/[slug] - 读取当前点赞数 + 当前访客是否点过
//   POST /api/likes/[slug] - 点赞 +1（同一访客 Cookie 永久去重）
//
// 安全防线（复用 ai/rate-limit 模块）：
//   - Origin 校验：只允许从本站调用
//   - 速率限制：每 IP 三级（分钟/小时/天）+ 全站日配额
//   - Cookie 去重：每浏览器对每篇文章只能点 1 次

const VOTED_COOKIE = (slug: string) => `liked_${slug}`;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 年（Cookie 有效期）

// ===== GET：读取点赞数 + 是否已点 =====
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  // KV 未配置时静默降级（前端检测到 configured=false 会隐藏按钮）
  if (!isKvConfigured()) {
    return Response.json({
      count: 0,
      voted: false,
      configured: false,
    });
  }

  const count = await getLikes(params.slug);
  const voted = (await cookies()).has(VOTED_COOKIE(params.slug));

  return Response.json({ count, voted, configured: true });
}

// ===== POST：点赞 +1 =====
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  if (!isKvConfigured()) {
    return Response.json(
      { error: "NOT_CONFIGURED", message: "点赞系统未配置" },
      { status: 503 }
    );
  }

  // 防线 1：Origin 校验
  if (!isOriginAllowed(req)) {
    return Response.json(
      { error: "FORBIDDEN_ORIGIN" },
      { status: 403 }
    );
  }

  // 防线 2：速率限制（复用 AI 助手的限流器）
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

  // 防线 3：Cookie 去重
  const cookieStore = await cookies();
  const cookieName = VOTED_COOKIE(params.slug);
  if (cookieStore.has(cookieName)) {
    // 已点过 → 返回当前数 + voted=true（不真的 +1）
    const count = await getLikes(params.slug);
    return Response.json({
      count,
      voted: true,
      alreadyVoted: true,
    });
  }

  // 全部通过 → 增加 + 设置 Cookie
  try {
    const newCount = await incrementLikes(params.slug);
    cookieStore.set(cookieName, "1", {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return Response.json({ count: newCount, voted: true });
  } catch (err) {
    console.error("[likes] increment failed:", err);
    return Response.json(
      { error: "INTERNAL_ERROR", message: "服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
