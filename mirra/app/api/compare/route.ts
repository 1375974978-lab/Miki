import { createHash } from "node:crypto";

import { createDemoComparison } from "@/lib/demo-data";
import type { ComparisonData, ComparisonTone } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Compliance boundary:
 * The product URLs are passed to a search-enabled model as identifiers only.
 * This app never fetches product pages, follows links, scrapes HTML, bypasses
 * logins, or requests anti-bot-protected content. Live results are synthesized
 * from public web-search evidence and must include source links.
 */

const toneValues: ComparisonTone[] = ["pink", "sand", "sage", "blue"];

const stringArray = {
  type: "array",
  items: { type: "string" },
  minItems: 1,
  maxItems: 4,
} as const;

const productSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    brand: { type: "string" },
    category: { type: "string" },
    tone: { type: "string", enum: toneValues },
    currentPrice: { type: "string" },
    regularPrice: { type: "string" },
    promotion: { type: "string" },
    positioning: { type: "string" },
    audience: { type: "string" },
    ingredients: stringArray,
    formula: { type: "string" },
    benefits: stringArray,
    pros: stringArray,
    cons: stringArray,
    scenarios: stringArray,
    skinTypes: stringArray,
    praise: stringArray,
    complaints: stringArray,
    tags: stringArray,
  },
  required: [
    "name",
    "brand",
    "category",
    "tone",
    "currentPrice",
    "regularPrice",
    "promotion",
    "positioning",
    "audience",
    "ingredients",
    "formula",
    "benefits",
    "pros",
    "cons",
    "scenarios",
    "skinTypes",
    "praise",
    "complaints",
    "tags",
  ],
} as const;

const rowSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    group: {
      type: "string",
      enum: ["价格与定位", "成分与功效", "体验与口碑"],
    },
    dimension: {
      type: "string",
      enum: ["price", "ingredients", "benefits", "reputation"],
    },
    label: { type: "string" },
    a: { type: "string" },
    b: { type: "string" },
    different: { type: "boolean" },
  },
  required: [
    "id",
    "group",
    "dimension",
    "label",
    "a",
    "b",
    "different",
  ],
} as const;

const comparisonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    products: {
      type: "object",
      additionalProperties: false,
      properties: {
        a: productSchema,
        b: productSchema,
      },
      required: ["a", "b"],
    },
    verdict: { type: "string" },
    whoBuys: {
      type: "object",
      additionalProperties: false,
      properties: {
        a: { type: "string" },
        b: { type: "string" },
      },
      required: ["a", "b"],
    },
    priceTrend: {
      type: "object",
      additionalProperties: false,
      properties: {
        status: {
          type: "string",
          enum: ["近期低价", "正常价", "价格偏高"],
        },
        summary: { type: "string" },
      },
      required: ["status", "summary"],
    },
    rows: {
      type: "array",
      items: rowSchema,
      minItems: 10,
      maxItems: 12,
    },
    sources: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "url"],
      },
    },
  },
  required: [
    "products",
    "verdict",
    "whoBuys",
    "priceTrend",
    "rows",
    "sources",
  ],
} as const;

function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2_048) return null;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as {
    output_text?: unknown;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (typeof record.output_text === "string") return record.output_text;

  return (record.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && item.text)
    .map((item) => item.text)
    .join("\n");
}

function extractCitationSources(payload: unknown) {
  const sources = new Map<string, { title: string; url: string }>();
  if (!payload || typeof payload !== "object") return [];

  const record = payload as {
    output?: Array<{
      content?: Array<{
        annotations?: Array<{
          type?: string;
          url?: string;
          title?: string;
        }>;
      }>;
    }>;
  };

  for (const item of record.output ?? []) {
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type !== "url_citation" || !annotation.url) continue;
        try {
          const parsed = new URL(annotation.url);
          if (!["http:", "https:"].includes(parsed.protocol)) continue;
          sources.set(annotation.url, {
            title: annotation.title || parsed.hostname,
            url: annotation.url,
          });
        } catch {
          // Ignore malformed citation URLs returned by an upstream provider.
        }
      }
    }
  }

  return [...sources.values()];
}

function parseComparison(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned) as Omit<
    ComparisonData,
    "id" | "createdAt" | "mode" | "links" | "disclaimer"
  > & {
    priceTrend: { status: string; summary: string };
  };
}

function finalizeComparison(
  comparison: ReturnType<typeof parseComparison>,
  citations: Array<{ title: string; url: string }>,
  linkA: string,
  linkB: string,
) {
  const combinedSources = [...comparison.sources, ...citations].filter(
    (source, index, array) =>
      source.url.startsWith("http") &&
      array.findIndex((item) => item.url === source.url) === index,
  );

  return {
    ...comparison,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    mode: "live" as const,
    links: { a: linkA, b: linkB },
    priceTrend: {
      ...comparison.priceTrend,
      checkedAt: new Date().toISOString(),
    },
    sources: combinedSources.slice(0, 10),
    disclaimer:
      "信息来自模型检索到的公开网页，价格、库存、活动与产品版本可能随时变化。购买前请以品牌官方或正规电商页面为准。",
  } satisfies ComparisonData;
}

async function readProviderError(response: Response) {
  const text = await response.text();
  try {
    const payload = JSON.parse(text) as {
      error?: { message?: string } | string;
      message?: string;
    };
    const message =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message || payload.message;
    return message
      ? `${response.status}: ${message}`
      : `${response.status}: ${text.slice(0, 240)}`;
  } catch {
    return `${response.status}: ${text.slice(0, 240)}`;
  }
}

function isAuthenticationError(status: number) {
  return status === 401 || status === 403;
}

function isModeFallbackError(status: number) {
  return status === 400 || status === 404 || status === 405 || status === 422;
}

function unique(values: string[]) {
  return values.filter(
    (value, index, array) =>
      value.length > 0 && array.indexOf(value) === index,
  );
}

async function listRelayModels(baseUrl: string, apiKey: string) {
  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(
      `中转站模型列表读取失败：${await readProviderError(response)}`,
    );
  }

  const payload = (await response.json()) as {
    data?: Array<{ id?: unknown }>;
  };
  return (payload.data ?? [])
    .map((item) => item.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

function buildModelPlan(configuredModel: string, availableModels: string[]) {
  if (availableModels.length === 0) {
    return {
      generalCandidates: configuredModel
        ? [configuredModel]
        : ["gpt-5-mini", "gpt-4.1-mini", "gpt-4o-mini"],
      searchCandidates: process.env.OPENAI_SEARCH_MODEL
        ? [process.env.OPENAI_SEARCH_MODEL]
        : [],
    };
  }

  const checkAvailable = (model: string) =>
    availableModels.includes(model);

  const generalCandidates = unique([
    configuredModel,
    "gpt-5.6-luna",
    "gpt-5-mini",
    "gpt-4.1-mini",
    "gpt-4.1",
    "gpt-4o",
  ]).filter(checkAvailable);

  const searchCandidates = unique([
    process.env.OPENAI_SEARCH_MODEL || "",
    "gpt-4o-search-preview",
    "gpt-4o-mini-search-preview",
    ...availableModels.filter((model) => model.includes("search")),
  ]).filter(checkAvailable);

  return { generalCandidates, searchCandidates };
}

function buildPrompt(linkA: string, linkB: string) {
  return `你是 MIRRA 的消费品研究员，专长是美妆、护肤和日用消费品。

请分析下面两个商品链接：
商品 A：${linkA}
商品 B：${linkB}

执行要求：
1. 使用联网搜索找到最可能的商品全名。若链接无法唯一识别，明确写出“链接信息有限，已按公开搜索结果中最接近的商品整理”，不要编造 SKU。
2. 只整合公开搜索结果中的品牌官网、电商公开页面、公开测评与公开用户反馈。不得声称抓取、爬取或绕过登录。
3. 价格与活动可能随时间变化。currentPrice、regularPrice 和 promotion 必须使用“公开信息中近期可见”的语气，不要声称是实时成交价。
4. 成分、功效与适用肤质要使用克制、非医疗化表达；不确定时写“公开信息未确认”。不得给出治愈、绝对安全或百分百有效等承诺。
5. “高频好评”和“高频吐槽”必须是对公开反馈的归纳，不能伪装成经过验证的真实用户样本。
6. rows 固定返回 10–12 条，覆盖价格、日常价、优惠、定位、适用人群、成分、配方、功效、场景、肤质、好评、槽点和注意事项。每格控制在 42 个汉字以内。different 表示 A/B 是否有实质差异。
7. 建议使用小红书式自然中文，但避免夸张营销和医疗断言。verdict 控制在 180 个汉字以内，要明确给出 A、B 各自适合谁，以及预算与场景选择。所有数组最多 4 条。
8. sources 只填写实际支持结论的公开网页，返回 2–5 条。优先品牌官网、正规电商公开页和可信测评。
9. 只返回符合给定 JSON Schema 的 JSON，不要 Markdown，不要额外解释。`;
}

async function tryResponsesApi(
  baseUrl: string,
  apiKey: string,
  modelCandidates: string[],
  linkA: string,
  linkB: string,
) {
  const preferredTool = process.env.OPENAI_WEB_SEARCH_TOOL || "web_search";
  const toolCandidates = unique([
    preferredTool,
    preferredTool === "web_search" ? "web_search_preview" : "web_search",
  ]);
  const errors: string[] = [];

  for (const model of modelCandidates) {
    for (const toolType of toolCandidates) {
      const response = await fetch(`${baseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          tools: [{ type: toolType }],
          input: buildPrompt(linkA, linkB),
          max_output_tokens: 3_000,
          reasoning: {
            effort: process.env.OPENAI_REASONING_EFFORT || "low",
          },
          text: {
            format: {
              type: "json_schema",
              name: "mirra_product_comparison",
              strict: true,
              schema: comparisonSchema,
            },
          },
        }),
        signal: AbortSignal.timeout(57_000),
      });

      if (response.ok) {
        const payload = (await response.json()) as unknown;
        const outputText = extractOutputText(payload);
        if (!outputText) {
          errors.push(`${model}/${toolType}: 返回中没有 output_text`);
          continue;
        }
        const comparison = parseComparison(outputText);
        return finalizeComparison(
          comparison,
          extractCitationSources(payload),
          linkA,
          linkB,
        );
      }

      const providerError = await readProviderError(response);
      errors.push(`${model}/${toolType}: ${providerError}`);
      if (isAuthenticationError(response.status)) {
        throw new Error(`中转站认证失败：${providerError}`);
      }
      if (!isModeFallbackError(response.status)) {
        throw new Error(`Responses API 请求失败：${providerError}`);
      }
    }
  }

  return errors;
}

function extractChatText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
  const content = record.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  return (content ?? [])
    .filter((item) => item.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n");
}

function extractChatCitationSources(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as {
    choices?: Array<{
      message?: {
        annotations?: Array<{
          type?: string;
          url?: string;
          title?: string;
        }>;
      };
    }>;
  };
  const sources = new Map<string, { title: string; url: string }>();

  for (const annotation of record.choices?.[0]?.message?.annotations ?? []) {
    if (annotation.type !== "url_citation" || !annotation.url) continue;
    try {
      const parsed = new URL(annotation.url);
      if (!["http:", "https:"].includes(parsed.protocol)) continue;
      sources.set(annotation.url, {
        title: annotation.title || parsed.hostname,
        url: annotation.url,
      });
    } catch {
      // Ignore malformed citation URLs returned by an upstream provider.
    }
  }

  return [...sources.values()];
}

async function tryChatSearchApi(
  baseUrl: string,
  apiKey: string,
  modelCandidates: string[],
  linkA: string,
  linkB: string,
) {
  const errors: string[] = [];

  for (const model of modelCandidates) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是 MIRRA 的消费品研究员。必须只返回符合要求的 JSON。",
          },
          { role: "user", content: buildPrompt(linkA, linkB) },
        ],
        web_search_options: { search_context_size: "medium" },
        max_tokens: 3_000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "mirra_product_comparison",
            strict: true,
            schema: comparisonSchema,
          },
        },
      }),
      signal: AbortSignal.timeout(52_000),
    });

    if (response.ok) {
      const payload = (await response.json()) as unknown;
      const outputText = extractChatText(payload);
      if (!outputText) {
        errors.push(`${model}: 返回中没有 message.content`);
        continue;
      }
      const comparison = parseComparison(outputText);
      return finalizeComparison(
        comparison,
        extractChatCitationSources(payload),
        linkA,
        linkB,
      );
    }

    const providerError = await readProviderError(response);
    errors.push(`${model}: ${providerError}`);
    if (isAuthenticationError(response.status)) {
      throw new Error(`中转站认证失败：${providerError}`);
    }
    if (!isModeFallbackError(response.status)) {
      throw new Error(`联网搜索模型请求失败：${providerError}`);
    }
  }

  return errors;
}

async function callOpenAI(linkA: string, linkB: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/+$/, "");
  const selectedModel = process.env.OPENAI_MODEL?.trim() || "auto";
  const configuredModel =
    selectedModel.toLowerCase() === "auto" ? "" : selectedModel;
  const availableModels = await listRelayModels(baseUrl, apiKey);
  const { generalCandidates, searchCandidates } = buildModelPlan(
    configuredModel,
    availableModels,
  );
  const apiMode = process.env.OPENAI_API_MODE || "auto";
  const responsesErrors: string[] = [];

  if (generalCandidates.length === 0) {
    throw new Error(
      `中转站没有可用的通用模型。可用模型：${availableModels.slice(0, 20).join(", ") || "列表为空"}`,
    );
  }

  if (apiMode === "auto" || apiMode === "responses") {
    try {
      const responsesResult = await tryResponsesApi(
        baseUrl,
        apiKey,
        generalCandidates,
        linkA,
        linkB,
      );
      if (responsesResult && !Array.isArray(responsesResult)) {
        return responsesResult;
      }
      if (Array.isArray(responsesResult)) {
        responsesErrors.push(...responsesResult);
      }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.startsWith("Responses API")
      ) {
        throw error;
      }
      responsesErrors.push(error.message);
    }
  }

  if (searchCandidates.length > 0) {
    const chatResult = await tryChatSearchApi(
      baseUrl,
      apiKey,
      searchCandidates,
      linkA,
      linkB,
    );
    if (chatResult && !Array.isArray(chatResult)) return chatResult;
  }

  throw new Error(
    `中转站没有可用的联网搜索模式。` +
      `Responses 尝试：${responsesErrors.join(" | ") || "未返回"}. ` +
      `联网模型候选：${searchCandidates.join(", ") || "无"}. ` +
      "请配置 OPENAI_SEARCH_MODEL，或接入独立 Web Search API。",
  );
}

interface RateBucket {
  count: number;
  resetAt: number;
}

// Best-effort burst protection when no persistent rate-limit store is present.
// It never stores product URLs or request payloads.
const localRateBuckets = new Map<string, RateBucket>();

function getClientAddress(request: Request) {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function hashClientAddress(address: string) {
  return createHash("sha256").update(address).digest("hex").slice(0, 24);
}

async function consumePersistentRateLimit(
  clientHash: string,
  limit: number,
  windowSeconds: number,
) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return null;

  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `mirra:compare:${bucket}:${clientHash}`;

  try {
    const response = await fetch(`${redisUrl.replace(/\/+$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds + 10)],
      ]),
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as Array<{ result?: unknown }>;
    const count = Number(payload[0]?.result);
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

async function consumeRateLimit(request: Request) {
  const limit = Math.max(
    1,
    Number.parseInt(process.env.AI_RATE_LIMIT_MAX || "6", 10),
  );
  const windowSeconds = Math.max(
    30,
    Number.parseInt(process.env.AI_RATE_LIMIT_WINDOW_SECONDS || "3600", 10),
  );
  const clientHash = hashClientAddress(getClientAddress(request));
  const persistentCount = await consumePersistentRateLimit(
    clientHash,
    limit,
    windowSeconds,
  );

  const now = Date.now();
  let count = persistentCount;
  let resetAt =
    Math.ceil(now / 1000 / windowSeconds) * windowSeconds * 1_000;

  if (count === null) {
    const current = localRateBuckets.get(clientHash);
    if (!current || current.resetAt <= now) {
      const next: RateBucket = {
        count: 1,
        resetAt: now + windowSeconds * 1_000,
      };
      localRateBuckets.set(clientHash, next);
      count = next.count;
      resetAt = next.resetAt;
      if (localRateBuckets.size > 2_000) {
        for (const [key, bucket] of localRateBuckets) {
          if (bucket.resetAt <= now) localRateBuckets.delete(key);
        }
      }
    } else {
      current.count += 1;
      count = current.count;
      resetAt = current.resetAt;
    }
  }

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

function rateLimitHeaders(
  rate: Awaited<ReturnType<typeof consumeRateLimit>>,
) {
  return {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rate.resetAt / 1_000)),
  };
}

async function verifyTurnstile(request: Request, token: unknown) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const required =
    process.env.TURNSTILE_REQUIRED === "true" ||
    process.env.VERCEL === "1";

  if (!secret) {
    if (required) {
      return {
        ok: false as const,
        status: 503,
        error: "Turnstile 尚未配置，实时 AI 接口已安全关闭。",
      };
    }
    return { ok: true as const };
  }

  if (
    process.env.VERCEL === "1" &&
    (secret.startsWith("1x000000") || secret.startsWith("2x000000"))
  ) {
    return {
      ok: false as const,
      status: 503,
      error: "生产环境不能使用 Cloudflare Turnstile 测试密钥。",
    };
  }

  if (typeof token !== "string" || token.length < 20 || token.length > 2_048) {
    return {
      ok: false as const,
      status: 400,
      error: "请先完成人机验证。",
    };
  }

  const form = new URLSearchParams({
    secret,
    response: token,
    remoteip: getClientAddress(request),
  });

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!response.ok) {
      return {
        ok: false as const,
        status: 503,
        error: "人机验证服务暂时不可用，请稍后重试。",
      };
    }

    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
      "error-codes"?: string[];
    };
    const expectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME?.trim();

    if (
      !result.success ||
      (result.action && result.action !== "mirra_compare") ||
      (expectedHostname &&
        result.hostname &&
        result.hostname !== expectedHostname)
    ) {
      return {
        ok: false as const,
        status: 403,
        error: `人机验证未通过：${result["error-codes"]?.join(", ") || "invalid-token"}`,
      };
    }

    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      status: 503,
      error: "人机验证超时，请重新提交。",
    };
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求内容必须是 JSON。" }, { status: 400 });
  }

  const record = body as {
    a?: unknown;
    b?: unknown;
    turnstileToken?: unknown;
  };
  const linkA = normalizeUrl(record.a);
  const linkB = normalizeUrl(record.b);

  if (!linkA || !linkB) {
    return Response.json(
      { error: "请分别粘贴有效的 http(s) 商品链接。" },
      { status: 400 },
    );
  }

  if (linkA === linkB) {
    return Response.json(
      { error: "两个链接相同，请换一个商品再对比。" },
      { status: 400 },
    );
  }

  const hasLiveApi = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (hasLiveApi) {
    const rate = await consumeRateLimit(request);
    if (!rate.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((rate.resetAt - Date.now()) / 1_000),
      );
      return Response.json(
        {
          error: `请求过于频繁，请在 ${Math.ceil(retryAfter / 60)} 分钟后再试。`,
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders(rate),
            "Retry-After": String(retryAfter),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const humanCheck = await verifyTurnstile(request, record.turnstileToken);
    if (!humanCheck.ok) {
      return Response.json(
        { error: humanCheck.error },
        {
          status: humanCheck.status,
          headers: {
            ...rateLimitHeaders(rate),
            "Cache-Control": "no-store",
          },
        },
      );
    }
  }

  try {
    const liveResult = await callOpenAI(linkA, linkB);
    const result = liveResult ?? createDemoComparison({ a: linkA, b: linkB });
    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "分析暂时失败，请稍后重试。";
    return Response.json({ error: message }, { status: 502 });
  }
}
