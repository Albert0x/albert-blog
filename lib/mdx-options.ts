import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

// 老王说明：MDX 渲染插件配置，集中维护
// - rehype-slug：给标题加 id（用于锚点和目录）
// - rehype-autolink-headings：标题加可点击锚点
// - rehype-pretty-code：基于 Shiki 的代码高亮（双主题：亮/暗）
// - remark-gfm：GitHub 风格 Markdown（表格、任务列表、删除线等）
const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed",
  },
  keepBackground: true,
  defaultLang: "plaintext",
};

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, prettyCodeOptions],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
} as const;
