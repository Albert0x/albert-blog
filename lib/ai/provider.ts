import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// 老王说明：LLM Provider - DeepSeek
// ⚠️ 关键决策：用 @ai-sdk/openai-compatible 而不是 @ai-sdk/openai
//   理由：@ai-sdk/openai@3.x 默认走 OpenAI 新版 /v1/responses 接口（用 input 字段），
//        而 DeepSeek 只支持经典的 /v1/chat/completions（用 messages 字段）
//        openai-compatible 这个包正是为 DeepSeek/Moonshot/通义/智谱 这类「OpenAI 兼容」服务设计
//
// 申请 API Key：https://platform.deepseek.com → 充值 ¥10 够你聊很久
// 设置环境变量：项目根目录建 .env.local，写入：
//   DEEPSEEK_API_KEY=sk-xxxxx
//
// 切换其他 OpenAI 兼容服务：把 baseURL + apiKey + 模型名换掉即可
//   通义千问 Dashscope: https://dashscope.aliyuncs.com/compatible-mode/v1
//   Moonshot Kimi:    https://api.moonshot.cn/v1
//   智谱 GLM:         https://open.bigmodel.cn/api/paas/v4
const apiKey = process.env.DEEPSEEK_API_KEY;

export const deepseek = createOpenAICompatible({
  name: "deepseek",
  apiKey: apiKey ?? "MISSING_KEY",
  baseURL: "https://api.deepseek.com/v1",
});

// 老王说明：模型选择
// - deepseek-chat: 通用对话 (V3 系列)，速度快，性价比最高（推荐）
// - deepseek-reasoner: 推理增强版 (R1)，复杂问题更强，但慢且贵
export const DEFAULT_MODEL = "deepseek-chat" as const;

// 检查是否配置了 API Key（chat route 用这个判断要不要返回"未配置"提示）
export function isAiConfigured(): boolean {
  return Boolean(apiKey && apiKey !== "MISSING_KEY");
}
