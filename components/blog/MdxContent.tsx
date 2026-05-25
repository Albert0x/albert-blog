import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";

// 老王说明：MDX 服务端渲染组件
// 后续可在这里加自定义 MDX 组件（比如 <Callout/>、<CodeSandbox/>）
const components = {
  // 自定义组件可以加在这里，比如：
  // Callout: (props: any) => <div className="callout">{props.children}</div>,
};

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components as MDXRemoteProps["components"]}
      options={mdxOptions}
    />
  );
}
