import { auth } from "@/auth";
import { upsertFile, deleteFile, postPath } from "@/lib/github";

// 老王说明：更新 / 删除单篇文章
// PUT    /api/admin/posts/[slug]  - 更新
// DELETE /api/admin/posts/[slug]  - 删除

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// ===== 更新文章 =====
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  const token = (session as { accessToken?: string })?.accessToken;
  if (!session || !token) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { slug } = await params;
  let body: { content?: string; sha?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const { content, sha } = body;
  if (!content || !sha) {
    return Response.json(
      { error: "MISSING_FIELDS", message: "content 和 sha 必填" },
      { status: 400 }
    );
  }

  try {
    const path = postPath(slug);
    const result = await upsertFile(
      token,
      path,
      content,
      `post: 更新 ${slug}`,
      sha
    );
    return Response.json({
      ok: true,
      sha: result.content?.sha,
      commitSha: result.commit.sha,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status === 409) {
      return Response.json(
        {
          error: "STALE_SHA",
          message: "文件已被其他地方修改过，请刷新后重试",
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

// ===== 删除文章 =====
export async function DELETE(req: Request, { params }: RouteContext) {
  const session = await auth();
  const token = (session as { accessToken?: string })?.accessToken;
  if (!session || !token) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { slug } = await params;
  let body: { sha?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (!body.sha) {
    return Response.json(
      { error: "MISSING_SHA", message: "sha 必填" },
      { status: 400 }
    );
  }

  try {
    const path = postPath(slug);
    await deleteFile(token, path, `post: 删除 ${slug}`, body.sha);
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    return Response.json(
      {
        error: "GITHUB_API_ERROR",
        message: e.message ?? "删除失败",
      },
      { status: e.status === 404 ? 404 : 500 }
    );
  }
}
