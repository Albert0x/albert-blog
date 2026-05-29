import Image from "next/image";

// 老王说明：MDX 文章里 ![alt](src) 渲染出来的 <img> 自动包装成 next/image
//
// next/image 自动获得的能力：
//   - 自动转 webp/avif（next.config 已配 formats）
//   - 响应式 srcset（按 sizes 生成多档分辨率）
//   - 懒加载（loading="lazy" 默认）
//   - LCP 占位防抖
//
// 难点：markdown 的 ![]() 无法传宽高
// 解决：在 alt 里用「|宽x高」编码尺寸
//   ![架构图|1600x900](/img/arch.png)
//   ![logo|200x40](/img/logo.svg)
// 不传尺寸时默认 1600x900（16:9），适合多数截图
//
// 远程图片必须在 next.config.mjs 的 remotePatterns 白名单里

interface Props {
  src?: string;
  alt?: string;
  title?: string;
}

// 老王说明：解析 alt 里的 |WxH 后缀，返回 [真实alt, width, height]
function parseAltSize(rawAlt = ""): {
  alt: string;
  width: number;
  height: number;
} {
  const match = rawAlt.match(/^(.*?)\|(\d+)x(\d+)$/);
  if (match) {
    return {
      alt: match[1].trim(),
      width: parseInt(match[2], 10),
      height: parseInt(match[3], 10),
    };
  }
  return { alt: rawAlt, width: 1600, height: 900 };
}

export function MdxImage({ src, alt: rawAlt, title }: Props) {
  if (!src) return null;
  const { alt, width, height } = parseAltSize(rawAlt);

  // 老王说明：远程图片用 unoptimized 兜底防止 next/image 报域名错
  // （正常情况下 next.config.mjs 的 remotePatterns 已配 GitHub）
  const isRemote = /^https?:\/\//.test(src);

  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 800px"
        className="rounded-xl border border-border/40 w-full h-auto"
        // 老王说明：远程图未在白名单时静默走原始 URL，避免线上挂掉
        unoptimized={isRemote && !isWhitelistedHost(src)}
      />
      {title && (
        <figcaption className="mt-2 text-center text-xs text-muted italic">
          {title}
        </figcaption>
      )}
    </figure>
  );
}

// 跟 next.config.mjs 的 remotePatterns 保持同步
const WHITELISTED_HOSTS = ["github.com", "avatars.githubusercontent.com"];

function isWhitelistedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return WHITELISTED_HOSTS.includes(host);
  } catch {
    return false;
  }
}
