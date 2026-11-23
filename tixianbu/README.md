# MIRRA

MIRRA 是一个面向美妆与消费品的双商品智能对比网站。用户粘贴两个公开商品链接后，网站通过支持联网搜索的 AI 模型整理价格、定位、成分、功效、使用场景、公开口碑和选购结论。

生产站点：https://mirra-xi-lovat.vercel.app

## 页面结构

界面采用全屏编辑式页面，通过顶部导航切换独立屏幕，不依赖整页纵向滚动：

- `#compare`：商品输入
- `#history`：本机历史
- `#result/overview`：选购结论
- `#result/compare`：逐项对比
- `#result/sources`：价格与来源

页面切换写回 URL hash，浏览器返回键和页面内返回按钮均可恢复上一屏。

链接规范不是独立页面，而是“开始一次对比”旁的可点击气泡，点击外部或按 `Esc` 可关闭。

视觉参考来自 Minimal Gallery 的极简导航与全屏图像结构，以及 Refero Styles 中 Isla Beauty、Glossier 等美妆案例的暖色纸面、单一红色强调、平面细线和大字号排版。项目和图片素材均为独立实现，不复制参考站资产。

## 已实现功能

- 双商品链接输入与示例快速填入
- 手机分享短链识别与商品详情页输入引导
- AI 公开网络信息检索与结构化输出
- 多维度横向对比表
- 差异点高亮、相同项弱化
- 核心亮点与避雷槽点卡片
- 功效标签
- 小红书式选购建议
- 价格位置判断与检索时间
- 公开来源链接
- 价格、成分、功效、口碑四组维度开关
- 基于 `localStorage` 的历史记录、回看、删除与清空
- 桌面、平板、手机响应式布局
- 无 API Key 时自动启用完整演示数据

## 合规边界

项目不包含商品页爬虫，不跟随用户链接抓取页面，不绕过登录或反自动化保护。链接只作为商品识别线索交给联网搜索模型，结果必须基于公开网页信息，并附带来源链接。

价格、库存、活动与产品版本会变化。页面使用“公开信息中近期可见价格”的表达，不宣称实时成交价。

建议使用品牌官网或电脑端商品详情页 URL。`3.cn`、`e.tb.cn` 等手机 App 分享短链常包含跳转和活动参数，即使链接公开可打开，也不一定能稳定指向具体 SKU；界面会识别此类短链并提示更换。

## 本地运行

要求 Node.js 22+。

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

如果暂时没有 API Key，网站会自动进入带有明确标识的“作品集演示数据”模式，所有页面、交互与历史记录仍可正常体验。

可以先检查中转站认证和模型状态：

```bash
pnpm check:ai
```

## 接入真实 AI 检索

复制环境变量示例：

```bash
cp .env.example .env.local
```

在 `.env.local` 中填写：

```bash
OPENAI_API_KEY=your_server_side_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=auto
OPENAI_API_MODE=auto
OPENAI_WEB_SEARCH_TOOL=web_search
OPENAI_SEARCH_MODEL=
OPENAI_REASONING_EFFORT=low

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_REQUIRED=true
TURNSTILE_EXPECTED_HOSTNAME=

# Optional Upstash REST rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AI_RATE_LIMIT_MAX=6
AI_RATE_LIMIT_WINDOW_SECONDS=3600
```

密钥只在 `app/api/compare/route.ts` 的服务端代码中读取，不会发送到浏览器。

如果使用 OpenAI 兼容中转站，将 `OPENAI_BASE_URL` 改为中转站提供的 Base URL，通常以 `/v1` 结尾。

`OPENAI_MODEL=auto` 会让接口先按常见模型顺序探测。`OPENAI_API_MODE=auto` 会先尝试 Responses API Web Search，失败后自动尝试兼容的 Chat Completions 联网模型。若中转站隐藏了模型列表，可手动填写 `OPENAI_MODEL` 和 `OPENAI_SEARCH_MODEL`。

## 防滥用配置

真实 API 模式下，接口会执行 Cloudflare Turnstile 人机校验，并按访问者限频：

- 默认每小时最多 6 次对比
- 使用 Upstash 时支持跨 Vercel 实例的持久限频
- 未配置 Upstash 时仍保留单实例短时防抖
- 如果启用了真实 API 但缺少 Turnstile 密钥，生产环境会安全关闭实时接口

正式 Turnstile widget 需要至少一个真实 FQDN，例如 `mirra.vercel.app` 或自定义域名；`localhost`、协议、端口和通配符不能作为正式 hostname。本地开发使用 Cloudflare 官方测试密钥，部署后应在 `dash.cloudflare.com > Turnstile` 创建正式 widget，并将 Site Key 和 Secret Key 填入环境变量。代码会拒绝在 Vercel 生产环境使用测试密钥。

## 部署到 Vercel

1. 将 `mirra` 目录上传到 GitHub 仓库。
2. 在 Vercel 中导入该仓库，Framework Preset 选择 Next.js。
3. 配置 OpenAI 中转站变量、Turnstile 密钥和可选的 Upstash 限频变量。
4. 部署。

未配置环境变量时也可以直接部署，网站会以演示模式运行。

## 项目结构

```text
app/
  api/compare/route.ts   服务端 AI 检索与结构化接口
  globals.css            全站视觉系统和响应式样式
  layout.tsx             元数据与字体
  page.tsx               首页入口
components/
  mirra-app.tsx          页面状态、输入与 API 调用
  comparison-result.tsx  结论、逐项对比与来源页面
  icons.tsx              轻量 SVG 图标
lib/
  types.ts               数据类型
  demo-data.ts           无密钥时的演示数据
  history.ts             版本化 localStorage 记录
```

## 视觉素材

- 首页美妆静物摄影：Polina Kovaleva，来源 [Pexels](https://www.pexels.com/photo/white-and-brown-bottles-on-white-textile-8100691/)，按 [Pexels License](https://www.pexels.com/license/) 使用。
- 标题与界面字体：Manrope Variable；编辑性斜体：Instrument Serif。


## 上线前检查

```bash
pnpm typecheck
pnpm build
```

建议再人工检查：

- 桌面 1440px、平板 768px、手机 390px
- 键盘 Tab 顺序与焦点可见性
- 历史记录刷新后是否保留
- 真实 API 模式的来源链接、价格时间与失败提示
- iOS Safari 与 Android Chrome 的表单和抽屉行为
