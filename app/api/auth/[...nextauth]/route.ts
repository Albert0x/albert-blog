// 老王说明：NextAuth v5 的标准 API 路由
// handlers 是 { GET, POST } 对象，要先解构再 export
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
