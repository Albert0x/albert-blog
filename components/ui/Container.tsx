import { cn } from "@/lib/utils";

// 老王说明：全站内容容器，统一最大宽度和左右内边距
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "narrow";
}

const sizeMap = {
  narrow: "max-w-3xl",  // 文章正文用
  default: "max-w-6xl", // 默认页面用
  wide: "max-w-7xl",    // 卡片网格用
};

export function Container({
  className,
  size = "default",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeMap[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
