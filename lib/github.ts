import { Octokit } from "@octokit/rest";

// 老王说明：GitHub REST API 封装 - 直接读写仓库文件
// 用户的 OAuth access_token 由 NextAuth 提供，不存任何敏感凭证

const OWNER = process.env.GITHUB_REPO_OWNER || "Albert0x";
const REPO = process.env.GITHUB_REPO_NAME || "albert-blog";
const BRANCH = process.env.GITHUB_REPO_BRANCH || "main";
const POSTS_DIR = "content/posts";

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
}

export interface FileContent {
  content: string;
  sha: string;
}

function createOctokit(token: string) {
  return new Octokit({ auth: token });
}

// 老王说明：列出 content/posts/ 下所有 mdx 文件
export async function listPosts(token: string): Promise<GithubFile[]> {
  const octo = createOctokit(token);
  try {
    const { data } = await octo.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: POSTS_DIR,
      ref: BRANCH,
    });
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item.type === "file" && /\.mdx?$/.test(item.name))
      .map((item) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        type: "file" as const,
      }));
  } catch (err) {
    console.error("[github] listPosts failed:", err);
    return [];
  }
}

// 老王说明：读取单个文件的内容（用于编辑预填）
export async function getFileContent(
  token: string,
  path: string
): Promise<FileContent | null> {
  const octo = createOctokit(token);
  try {
    const { data } = await octo.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH,
    });
    if (Array.isArray(data) || data.type !== "file") return null;
    return {
      content: Buffer.from(data.content, "base64").toString("utf8"),
      sha: data.sha,
    };
  } catch (err) {
    console.error("[github] getFileContent failed:", err);
    return null;
  }
}

// 老王说明：创建或更新文件
// - 新文件不传 sha
// - 更新已有文件必须传 sha（GitHub 的乐观锁机制）
export async function upsertFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
) {
  const octo = createOctokit(token);
  const { data } = await octo.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    branch: BRANCH,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha,
  });
  return data;
}

// 老王说明：删除文件
export async function deleteFile(
  token: string,
  path: string,
  message: string,
  sha: string
) {
  const octo = createOctokit(token);
  const { data } = await octo.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    branch: BRANCH,
    message,
    sha,
  });
  return data;
}

// 老王说明：构造文章文件路径（slug → content/posts/slug.mdx）
export function postPath(slug: string): string {
  // 防御：slug 不能含路径符号，避免越权写其他目录
  const safe = slug.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${POSTS_DIR}/${safe}.mdx`;
}

// 老王说明：从文件名取 slug
export function slugFromPath(path: string): string {
  return path.replace(/^.*\//, "").replace(/\.mdx?$/, "");
}
