import { auth } from "@/auth";
import { upsertFile, postPath } from "@/lib/github";

// 老王说明：创建新文章 - POST /api/admin/posts
// body: { slug: string, content: string }
export async function POST(req: Request) {
  const session = await auth();
  const token = (session as { accessToken?: string })?.accessToken;
  if (!session || !token) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { slug?: string; content?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { slug, content } = body;
  if (!slug || !content) {
    return Response.json(
      { error: "MISSING_FIELDS", message: "slug 和 content 必填" },
      { status: 400 }
    );
  }

  // 老王说明：防御 - slug 只允许 a-z0-9-_，避免越权写其他目录
  if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
    return Response.json(
      { error: "INVALID_SLUG", message: "slug 只能包含字母、数字、连字符、下划线" },
      { status: 400 }
    );
  }

  try {
    const path = postPath(slug);
    const result = await upsertFile(
      token,
      path,
      content,
      `post: 新增文章 ${slug}`
    );
    return Response.json({
      ok: true,
      path,
      sha: result.content?.sha,
      commitSha: result.commit.sha,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 422) {
      return Response.json(
        {
          error: "FILE_EXISTS",
          message: `slug "${slug}" 已存在，请用编辑功能修改或换个 slug`,
        },
        { status: 409 }
      );
    }
    return Response.json(
      {
        error: "GITHUB_API_ERROR",
        message: e.message ?? "GitHub API 调用失败",
      },
      { status: 500 }
    );
  }
}
