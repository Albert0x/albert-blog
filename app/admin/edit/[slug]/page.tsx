import { notFound } from "next/navigation";
import matter from "gray-matter";
import { auth } from "@/auth";
import { getFileContent, postPath } from "@/lib/github";
import { PostEditor } from "@/components/admin/PostEditor";

// 老王说明：编辑现有文章页
// 通过 GitHub API 实时拉文件（保证编辑的是最新版），不读本地
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const token = (session as { accessToken?: string })?.accessToken;
  if (!token) notFound();

  const file = await getFileContent(token, postPath(slug));
  if (!file) notFound();

  const { data, content } = matter(file.content);

  return (
    <PostEditor
      slug={slug}
      initialBody={content}
      initialFrontmatter={data}
      sha={file.sha}
    />
  );
}
