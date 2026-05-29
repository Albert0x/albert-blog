import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { Pre } from "./Pre";
import { MdxImage } from "./MdxImage";

// 老王说明：MDX 服务端渲染组件
// 自定义 components 在这里覆盖原生 HTML 标签：
//   - pre: 替换成带「复制按钮」的客户端组件
//   - img: 替换成 next/image 自动优化（webp/avif/lazy/responsive）
const components = {
  pre: Pre,
  img: MdxImage,
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
