import GithubSlugger from "github-slugger";

// 老王说明：从 MDX 正文里提取 h2 / h3 标题，生成目录项
// - 用 github-slugger 保证生成的 id 跟 rehype-slug 完全一致（不然 TOC 锚点点不中）
// - 跳过代码块里的 ## ###（防止把代码注释误识别为标题）
// - 同名标题自动加 -1 -2 后缀（github-slugger 自动处理）
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractToc(mdx: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  const lines = mdx.split("\n");
  let inCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine;

    // 老王说明：代码块切换（``` 或 ~~~）
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // 匹配 ## 或 ### 开头
    const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    // 老王说明：剥掉 Markdown 装饰（** _ ` 等）和链接，只留可见文本
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\([^)]*\)/g, "$1")
      .trim();

    const id = slugger.slug(text);
    items.push({ id, text, level });
  }

  return items;
}
