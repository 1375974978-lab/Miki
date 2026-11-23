import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseEnv(source) {
  const result = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const envPath = resolve(process.cwd(), ".env.local");
const env = parseEnv(await readFile(envPath, "utf8"));
const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const baseUrl = (
  env.OPENAI_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  "https://api.openai.com/v1"
).replace(/\/+$/, "");

if (!apiKey) {
  console.error("缺少 OPENAI_API_KEY");
  process.exit(1);
}

console.log(`Base URL: ${baseUrl}`);
console.log(`API Key: <set: ${apiKey.length} chars>`);

const modelsResponse = await fetch(`${baseUrl}/models`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

if (!modelsResponse.ok) {
  const text = await modelsResponse.text();
  console.error(`模型列表请求失败 (${modelsResponse.status})`);
  console.error(text.slice(0, 600));
  process.exit(1);
}

const modelsPayload = await modelsResponse.json();
const models = (modelsPayload.data || [])
  .map((item) => item?.id)
  .filter((id) => typeof id === "string");
const searchModels = models.filter((id) => id.includes("search"));

console.log(`模型列表可读取，共 ${models.length} 个模型`);
console.log(`前 40 个模型：${models.slice(0, 40).join(", ") || "(列表为空)"}`);
console.log(
  `联网候选：${searchModels.length ? searchModels.join(", ") : "未发现名称含 search 的模型"}`,
);
console.log(
  `当前配置：model=${env.OPENAI_MODEL || "(未设置)"}, mode=${env.OPENAI_API_MODE || "auto"}`,
);
