import { PostEditor } from "@/components/admin/PostEditor";

// 老王说明：新建文章页 - 空白模板
const TEMPLATE_BODY = `## 开篇

这里写文章正文。

支持 **Markdown** 全部语法 + MDX 内嵌 React 组件。

## 二级标题

\`\`\`ts
// 代码块带 Shiki 高亮
function hello() {
  return "world";
}
\`\`\`

> 引用块也行。
`;

export default function NewPostPage() {
  return <PostEditor initialBody={TEMPLATE_BODY} />;
}
