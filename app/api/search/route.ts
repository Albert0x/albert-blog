import { searchPosts } from "@/lib/search";

// 老王说明：站内搜索 API
//   GET /api/search?q=keyword&limit=8
//
// 安全：
//   - 长度截断（防止超长 query 攻击 MiniSearch tokenize）
//   - 空 query 直接返回 []，不调底层
//
// 没做速率限制：MiniSearch 全在内存里跑，CPU 成本低，没必要
// 如果未来流量大了，可以加 lib/ai/rate-limit 限流
export const dynamic = "force-dynamic"; // 不缓存搜索结果

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawQuery = (url.searchParams.get("q") ?? "").slice(0, 100); // 最长 100 字符
  const limit = Math.min(
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "8", 10)),
    20
  );

  const q = rawQuery.trim();
  if (!q) {
    return Response.json({ hits: [], query: q });
  }

  const hits = searchPosts(q, limit);
  return Response.json({ hits, query: q });
}
