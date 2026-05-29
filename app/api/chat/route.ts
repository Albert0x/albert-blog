import { streamText, type UIMessage, type ModelMessage } from "ai";
import { deepseek, DEFAULT_MODEL, isAiConfigured } from "@/lib/ai/provider";
import {
  searchKnowledge,
  getKnowledgeOverview,
} from "@/lib/ai/knowledge";
import {
  rateLimit,
  getClientIp,
  isOriginAllowed,
} from "@/lib/ai/rate-limit";
import { siteConfig } from "@/lib/site-config";

// 老王说明：消息长度与历史轮数限制 - 防止恶意大 prompt 消耗 token
const MAX_MESSAGE_CHARS = 1000;       // 单条消息最长 1000 字符
const MAX_HISTORY_MESSAGES = 20;      // 总对话历史最多 20 条（10 轮）

// 老王说明：AI 聊天接口
// - POST /api/chat { messages: UIMessage[] }
// - RAG 流程：检索博客 → 拼上下文 → 流式调用 DeepSeek → SSE 流式返回
// - runtime 用默认 Node.js（lib/ai/knowledge 用了 fs 读 MDX，Edge 跑不了）
export const maxDuration = 30; // Vercel 函数超时 30s

interface ChatRequest {
  messages: UIMessage[];
}

export async function POST(req: Request) {
  // ===== 防御层 0：紧急 Kill Switch =====
  // 老王说明：在 Vercel 控制台把环境变量 AI_ENABLED 改成 "false"
  // 触发重新部署后，AI 助手立即下线，无需改代码、无需 push
  // 这是「检测到被刷 / 余额告警」时的应急按钮
  if (process.env.AI_ENABLED === "false") {
    return Response.json(
      {
        error: "AI_DISABLED",
        message: "AI 助手暂时维护中，请稍后再试 🛠",
      },
      { status: 503 }
    );
  }

  // ===== 防御层 1：未配置 API Key =====
  if (!isAiConfigured()) {
    return Response.json(
      {
        error: "AI_NOT_CONFIGURED",
        message:
          "AI 助手尚未配置 API Key。请在项目根目录新建 .env.local 写入 DEEPSEEK_API_KEY=sk-xxx，重启服务即可启用。",
      },
      { status: 503 }
    );
  }

  // ===== 防御层 2：Origin 来源校验 - 防止第三方直接调你的接口 =====
  if (!isOriginAllowed(req)) {
    return Response.json(
      { error: "FORBIDDEN_ORIGIN", message: "请通过博客页面访问 AI 助手。" },
      { status: 403 }
    );
  }

  // ===== 防御层 3：IP 速率限制 - 每分钟/小时/天三级保护 =====
  const ip = getClientIp(req);
  const limit = await rateLimit(ip);
  if (!limit.ok) {
    return Response.json(
      { error: "RATE_LIMITED", message: limit.reason },
      {
        status: 429,
        headers: limit.retryAfterSec
          ? { "Retry-After": String(limit.retryAfterSec) }
          : undefined,
      }
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  let { messages = [] } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "EMPTY_MESSAGES" }, { status: 400 });
  }

  // ===== 防御层 4：消息体积限制 - 防大 prompt 消耗 token =====
  // 4.1 截断过多历史（只保留最近 N 条）
  if (messages.length > MAX_HISTORY_MESSAGES) {
    messages = messages.slice(-MAX_HISTORY_MESSAGES);
  }

  // 4.2 单条消息长度上限
  const lastUserMsgRaw = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUserMsgRaw
    ? (lastUserMsgRaw.parts ?? [])
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("")
    : "";
  if (lastUserText.length > MAX_MESSAGE_CHARS) {
    return Response.json(
      {
        error: "MESSAGE_TOO_LONG",
        message: `提问太长啦（${lastUserText.length} 字），请精简到 ${MAX_MESSAGE_CHARS} 字以内。`,
      },
      { status: 413 }
    );
  }

  // 老王说明：把 UIMessage 数组手动转成 ModelMessage 数组
  // 原本用 convertToModelMessages，但 AI SDK v6 的该函数在某些场景下返回的结构
  // 跟 streamText 期望的不一致（standardizePrompt 内部 .some 报错），这里手写更稳
  const modelMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join(""),
  }));

  // 老王说明：取最后一条用户消息作为检索 query（直接复用上面已提取的 lastUserText）
  const query = lastUserText;

  // 老王说明：在博客知识库里检索 Top 3 相关切片
  const hits = query ? searchKnowledge(query, 3) : [];
  const overview = getKnowledgeOverview();

  // 老王说明：构造 system prompt - 让 AI 扮演「博客主人 Albert 的助手」
  // 强约束：仅基于检索到的内容回答，禁止编造，遇到不知道的事直接承认
  const knowledgeContext = hits.length
    ? hits
        .map(
          (h, i) =>
            `【片段${i + 1}】《${h.postTitle}》(分类: ${h.postCategory})\n${h.content}`
        )
        .join("\n\n---\n\n")
    : "（本次未检索到强相关内容）";

  const postsList = overview.posts
    .map((p) => `- 《${p.title}》(${p.category}) — ${p.description}`)
    .join("\n");

  const systemPrompt = `你是 ${siteConfig.name} 的 AI 博客助手，工业互联网 × AI 应用 × 全栈工程方向。

# 你的任务
基于博客主人 ${siteConfig.name} 已发表的文章和项目，专业、简洁地回答访客提问。

# 博客主人简介
- 名字：${siteConfig.name}
- 角色：${siteConfig.author.role}
- 简介：${siteConfig.author.bio}

# 博客文章总览
${postsList}

# 本次问题相关的文章片段（已检索）
${knowledgeContext}

# 回答规则
1. **严格基于上述上下文回答**，不要编造博客里没有的内容。
2. 如果上下文没相关信息，**坦率说"博客里暂时没有这方面的内容"**，并建议访客通过留言板联系博主。
3. 回答用中文，简洁有重点，技术内容可用 Markdown（代码块、列表）。
4. 不要写"根据片段X"这种生硬引用，要自然地融入回答。
5. 如果用到了某篇文章的内容，**在回答末尾用一行简短的"📚 相关文章：《xxx》"提示**。
6. 保持 ${siteConfig.name} 的视角（用"我"或"博客主"），不要说"作者认为"。
7. 不要回答跟博客无关的话题（比如数学题、闲聊），礼貌引导回到技术话题。`;

  // 老王说明：流式调用 LLM
  const result = streamText({
    model: deepseek(DEFAULT_MODEL),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.5,
    maxOutputTokens: 800,
  });

  // 老王说明：把检索命中的文章 slug 注入到「最后一条消息」的 metadata
  // ⚠️ 关键：messageMetadata 回调对每个 stream part 都会调，必须按 part.type 判断只输出一次
  // 否则同一组 metadata 会被反复 merge，导致客户端 messages 结构错乱（messages.some 报错）
  const sources = hits.map((h) => ({
    slug: h.postSlug,
    title: h.postTitle,
    category: h.postCategory,
  }));

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      // 仅在流式响应结束时附加引用 metadata，避免重复
      if (part.type === "finish") {
        return { sources };
      }
      return undefined;
    },
  });
}
