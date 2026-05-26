import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

// 老王说明：MDX 渲染插件配置，集中维护
// - rehype-slug：给标题加 id（用于锚点和目录）
// - rehype-autolink-headings：标题加可点击锚点
// - rehype-pretty-code：基于 Shiki 的代码高亮（双主题：亮/暗）
// - remark-gfm：GitHub 风格 Markdown（表格、任务列表、删除线等)
const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed",
  },
  keepBackground: true,
  defaultLang: "plaintext",
};

// 老王说明：严格匹配 MDXRemoteProps["options"] 类型
// ⚠️ 千万不能加 `as const`，否则数组变成 readonly tuple，
// 会和 next-mdx-remote 期望的可变 `Pluggable[]` 不兼容，build 时报类型错
export const mdxOptions: MDXRemoteProps["options"] = {
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
};
