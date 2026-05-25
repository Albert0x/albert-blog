// 老王说明：项目数据集中维护（已脱敏 - 全部为学习实践/探索性质）
// 后续如需文章化展示，可迁移到 content/projects/*.mdx，目前 YAGNI

export interface Project {
  slug: string;
  title: string;
  domain: "工业互联网" | "AI 应用" | "全栈工程" | "小程序";
  description: string;
  highlight: string;       // 一句话亮点
  painPoint: string;       // 业务痛点（定性描述）
  techStack: string[];     // 技术栈标签
  metrics?: string[];      // 实践收获（已脱敏，定性描述）
  links?: {
    github?: string;
    demo?: string;
    article?: string;      // 关联博客文章 slug
  };
  status: "实践中" | "迭代中" | "已完成" | "探索中";
  // 卡片渐变色（视觉变化）
  gradient: string;
}

export const projects: Project[] = [
  {
    slug: "iems-energy-platform",
    title: "工业能源管理平台（学习实践）",
    domain: "工业互联网",
    description:
      "围绕工业能源管理场景做的架构探索：从现场协议接入、数据存储、到 Web 可视化的端到端实践。",
    highlight: "工业能源管理系统的整体架构演练",
    painPoint: "工业现场能耗黑盒，难以定位高耗能环节。",
    techStack: ["React", "Python", "FastAPI", "InfluxDB", "PostgreSQL", "Modbus"],
    metrics: [
      "练习多设备并发数据采集",
      "练习时序数据的分层存储",
      "练习权限与数据隔离设计",
    ],
    status: "实践中",
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
    links: { article: "iems-integration-notes" },
  },
  {
    slug: "carbon-management",
    title: "企业碳管理系统（架构演练）",
    domain: "工业互联网",
    description:
      "面向双碳目标的碳排放核算与管理平台架构探索，研究范围 1/2/3 排放的数据建模与自动化核算思路。",
    highlight: "双碳政策下的数字化场景探索",
    painPoint: "传统碳排放统计依赖手工，效率低、易出错。",
    techStack: ["React", "Python", "PostgreSQL", "ECharts"],
    metrics: [
      "研究温室气体核算方法学",
      "练习多维度报表数据建模",
      "练习业务规则引擎设计",
    ],
    status: "探索中",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
  {
    slug: "industrial-rag-assistant",
    title: "工业 RAG 知识助手（实验性）",
    domain: "AI 应用",
    description:
      "把工业设备手册塞进 RAG，让自然语言查询工艺资料成为可能。一次 RAG 在领域知识库的实验性探索。",
    highlight: "RAG 在工业知识库的可行性验证",
    painPoint: "领域文档查阅困难，关键词搜索往往不准。",
    techStack: ["Python", "LangChain", "Qdrant", "bge-large-zh", "本地 LLM"],
    metrics: [
      "练习领域语料切片策略",
      "练习查询改写与检索优化",
      "研究本地化部署方案",
    ],
    status: "探索中",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    links: { article: "rag-in-industry" },
  },
  {
    slug: "gateway-data-collector",
    title: "工业网关数据采集（技术探索）",
    domain: "工业互联网",
    description:
      "围绕工业网关做的多协议数据采集中间层学习项目，统一封装 Modbus RTU / Modbus TCP / MQTT。",
    highlight: "工业协议统一收敛的工程实践",
    painPoint: "现场设备协议碎片化，上层应用难以统一接入。",
    techStack: ["Python", "Modbus", "MQTT", "Docker"],
    metrics: [
      "练习多协议适配封装",
      "练习断线重连与数据补偿",
      "练习容器化部署",
    ],
    status: "已完成",
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    slug: "office-oa-miniprogram",
    title: "OA 办公小程序（框架实践）",
    domain: "小程序",
    description:
      "基于 unibest（uniapp 增强版）的 OA 小程序学习项目，覆盖审批 / 公告 / 考勤 / 报销等模块的设计与实现。",
    highlight: "unibest 框架的工程化实战",
    painPoint: "日常办公分散在多个工具里，效率不高。",
    techStack: ["unibest", "uniapp", "Vue 3", "TypeScript", "Pinia"],
    metrics: [
      "练习小程序工程化与状态管理",
      "练习审批流程的前端建模",
    ],
    status: "迭代中",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    slug: "admin-template",
    title: "工业后台管理模板",
    domain: "全栈工程",
    description:
      "沉淀多次开发经验的通用后台模板，整合权限 / 数据可视化 / 设备管理 / 报警系统等常用模块。",
    highlight: "可复用的管理系统脚手架",
    painPoint: "每个新项目都从零搭后台，重复造轮子。",
    techStack: ["React", "TypeScript", "Ant Design Pro", "ECharts", "Zustand"],
    metrics: [
      "练习权限模型抽象",
      "练习通用组件库设计",
      "练习模板可配置化",
    ],
    status: "迭代中",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
];

export function getProjectsByDomain(domain: Project["domain"]): Project[] {
  return projects.filter((p) => p.domain === domain);
}

export function getAllDomains(): Project["domain"][] {
  return Array.from(new Set(projects.map((p) => p.domain)));
}

export function getAllTechStacks(): string[] {
  const set = new Set<string>();
  projects.forEach((p) => p.techStack.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}
