"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ComparisonResult,
  type ResultSection,
} from "./comparison-result";
import { Icon } from "./icons";
import { TurnstileWidget } from "./turnstile-widget";
import {
  clearHistory,
  loadHistory,
  removeHistoryEntry,
  saveComparison,
} from "@/lib/history";
import type { ComparisonData, HistoryEntry } from "@/lib/types";

type MainScreen = "compare" | "history";
type ResultScreen = `result/${ResultSection}`;
type Screen = MainScreen | "loading" | ResultScreen;

const analysisStages = [
  "识别商品与版本",
  "拆解成分与核心功效",
  "归纳公开测评与用户反馈",
  "生成你的选择结论",
];

const sampleLinks = {
  a: "https://www.lancome.com.cn/",
  b: "https://www.esteelauder.com.cn/",
};

const screenHashes: Record<Screen, string> = {
  compare: "#compare",
  history: "#history",
  loading: "#analyzing",
  "result/overview": "#result/overview",
  "result/compare": "#result/compare",
  "result/sources": "#result/sources",
};

const mainNavigation: Array<{
  screen: MainScreen;
  label: string;
}> = [
  { screen: "compare", label: "对比" },
  { screen: "history", label: "历史" },
];

const resultNavigation: Array<{
  screen: ResultScreen;
  label: string;
}> = [
  { screen: "result/overview", label: "结论" },
  { screen: "result/compare", label: "逐项对比" },
  { screen: "result/sources", label: "来源" },
];

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

type LinkStatus = "empty" | "invalid" | "short" | "detail" | "unknown";

function getLinkStatus(value: string): {
  status: LinkStatus;
  message: string;
} {
  if (!value.trim()) {
    return {
      status: "empty",
      message: "请粘贴电脑端商品详情页。",
    };
  }
  if (!isValidUrl(value)) {
    return {
      status: "invalid",
      message: "请输入以 http:// 或 https:// 开头的完整链接。",
    };
  }

  const hostname = new URL(value).hostname.toLowerCase();
  const shortLinkHosts = [
    "3.cn",
    "u.jd.com",
    "e.tb.cn",
    "m.tb.cn",
    "s.click.taobao.com",
  ];
  const detailHosts = [
    "item.jd.com",
    "detail.tmall.com",
    "detail.tmall.hk",
    "world.tmall.com",
  ];

  if (
    shortLinkHosts.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    )
  ) {
    return {
      status: "short",
      message: "分享短链无法稳定定位 SKU，请改用商品详情页地址。",
    };
  }
  if (
    detailHosts.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    )
  ) {
    return {
      status: "detail",
      message: "商品详情页格式，可进入公开信息检索。",
    };
  }
  return {
    status: "unknown",
    message: "可尝试；品牌官网或商品详情页通常更准确。",
  };
}

function getHostLabel(value: string) {
  if (!isValidUrl(value)) return "等待粘贴";
  return new URL(value).hostname.replace(/^www\./, "");
}

function parseScreen(): Screen {
  const raw = window.location.hash.replace(/^#/, "") || "compare";
  if (raw === "history" || raw === "loading") return raw;
  if (raw === "result/overview") return "result/overview";
  if (raw === "result/compare") return "result/compare";
  if (raw === "result/sources") return "result/sources";
  return "compare";
}

function screenRank(screen: Screen) {
  if (screen.startsWith("result/")) return 3;
  const order: Record<MainScreen, number> = {
    compare: 0,
    history: 1,
  };
  return screen === "loading" ? 0 : order[screen as MainScreen] ?? 0;
}

function Wordmark() {
  return (
    <span className="wordmark">
      <span>MIRRA</span>
      <i aria-hidden="true" />
    </span>
  );
}

function SiteHeader({
  screen,
  onNavigate,
  onBack,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}) {
  const isResult = screen.startsWith("result/");
  const navItems = isResult ? resultNavigation : mainNavigation;
  return (
    <header className={`site-header ${isResult ? "is-detail" : ""}`}>
      <div className="site-header-left">
        {isResult ? (
          <button className="back-link" type="button" onClick={onBack}>
            <Icon name="arrow-left" size={15} />
            返回
          </button>
        ) : (
          <button
            className="wordmark-button"
            type="button"
            onClick={() => onNavigate("compare")}
          >
            <Wordmark />
          </button>
        )}
      </div>

      <nav className="header-navigation" aria-label={isResult ? "结果页" : "主导航"}>
        {navItems.map((item) => (
          <button
            className={screen === item.screen ? "is-active" : ""}
            key={item.screen}
            type="button"
            onClick={() => onNavigate(item.screen)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <span />
    </header>
  );
}

function LinkField({
  side,
  value,
  onChange,
}: {
  side: "A" | "B";
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = `product-link-${side.toLowerCase()}`;
  const statusId = `${inputId}-status`;
  const linkStatus = getLinkStatus(value);

  return (
    <label className="link-field" htmlFor={inputId}>
      <span className="link-field-head">
        <span>{side}</span>
        <strong>商品 {side}</strong>
        {value && <em>{getHostLabel(value)}</em>}
      </span>
      <span className={`link-input-shell is-${linkStatus.status}`}>
        <input
          id={inputId}
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="粘贴商品详情页 URL"
          aria-describedby={statusId}
        />
        {value && (
          <button
            type="button"
            className="clear-input"
            aria-label={`清空商品 ${side} 链接`}
            onClick={(event) => {
              event.preventDefault();
              onChange("");
            }}
          >
            <Icon name="close" size={12} />
          </button>
        )}
      </span>
      <span
        className={`link-field-status is-${linkStatus.status}`}
        id={statusId}
        role="status"
        aria-live="polite"
      >
        <i aria-hidden="true" />
        {linkStatus.message}
      </span>
    </label>
  );
}

function CompareScreen({
  linkA,
  linkB,
  error,
  onLinkA,
  onLinkB,
  onUseSample,
  onSubmit,
  turnstileSiteKey,
  turnstileToken,
  turnstileResetKey,
  onTurnstileToken,
}: {
  linkA: string;
  linkB: string;
  error: string;
  onLinkA: (value: string) => void;
  onLinkB: (value: string) => void;
  onUseSample: () => void;
  onSubmit: () => void;
  turnstileSiteKey?: string;
  turnstileToken: string;
  turnstileResetKey: number;
  onTurnstileToken: (token: string) => void;
}) {
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const shortLink =
    getLinkStatus(linkA).status === "short" ||
    getLinkStatus(linkB).status === "short";

  useEffect(() => {
    if (!guideOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!guideRef.current?.contains(event.target as Node)) {
        setGuideOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGuideOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [guideOpen]);

  return (
    <section className="page-shell compare-screen">
      <img
        className="cover-image"
        src="/images/hero-beauty.jpg"
        alt="奶油色台面上的护肤精华与木质瓶盖"
      />
      <span className="cover-scrim" aria-hidden="true" />
      <div className="cover-intro">
        <h1>
          MIRRA<span>®</span>
        </h1>
        <p>两支产品，同一套判断标准。</p>
      </div>

      <form
        className="compare-form-panel"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-bar-heading">
          <div className="form-heading-left">
            <p>开始一次对比</p>
            <div className="link-guide-popover" ref={guideRef}>
              <button
                className="link-guide-trigger"
                type="button"
                aria-expanded={guideOpen}
                aria-controls="link-guide-bubble"
                onClick={() => setGuideOpen((open) => !open)}
              >
                链接规范
                <Icon name={guideOpen ? "close" : "chevron-down"} size={12} />
              </button>
              {guideOpen && (
                <div
                  className="link-guide-bubble"
                  id="link-guide-bubble"
                  role="dialog"
                  aria-label="链接规范"
                >
                  <span className="bubble-point" aria-hidden="true" />
                  <div className="guide-rule is-allowed">
                    <Icon name="check" size={13} />
                    <p>
                      <strong>推荐</strong>
                      品牌官网或电脑端商品详情页
                    </p>
                  </div>
                  <div className="guide-rule is-blocked">
                    <Icon name="close" size={13} />
                    <p>
                      <strong>避免</strong>
                      3.cn、e.tb.cn 等手机 App 分享短链
                    </p>
                  </div>
                  <small>在商品页打开后，复制地址栏中的完整 URL。</small>
                </div>
              )}
            </div>
          </div>
          <button className="text-button" type="button" onClick={onUseSample}>
            填入示例
            <Icon name="arrow-right" size={13} />
          </button>
        </div>

        <div className="form-bar">
          <LinkField side="A" value={linkA} onChange={onLinkA} />
          <span className="form-divider" aria-hidden="true" />
          <LinkField side="B" value={linkB} onChange={onLinkB} />
          <button
            className="submit-button"
            type="submit"
            disabled={
              !isValidUrl(linkA) ||
              !isValidUrl(linkB) ||
              shortLink ||
              (Boolean(turnstileSiteKey) && !turnstileToken)
            }
          >
            <span>{shortLink ? "替换分享短链" : "开始分析"}</span>
            <Icon name="arrow-right" size={17} />
          </button>
        </div>

        {error && (
          <div className="inline-error" role="alert">
            <Icon name="alert" size={14} />
            {error}
          </div>
        )}

        <div className="form-bottom">
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            resetKey={turnstileResetKey}
            onToken={onTurnstileToken}
          />
        </div>
      </form>
    </section>
  );
}

function HistoryScreen({
  entries,
  onSelect,
  onRemove,
  onClear,
  onCompare,
}: {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  return (
    <section className="page-shell history-screen">
      <div className="history-header">
        <div>
          <p className="eyebrow">Local Archive / 03</p>
          <h1>你的比较记录。</h1>
        </div>
        {entries.length > 0 && (
          <button className="text-button" type="button" onClick={onClear}>
            清空记录
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="history-empty">
          <span>00</span>
          <h2>这里还没有对比。</h2>
          <p>完成第一组比较后，结果会自动保存在当前浏览器。</p>
          <button className="inline-link" type="button" onClick={onCompare}>
            开始第一次对比
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      ) : (
        <div className="history-list">
          {entries.map((entry, index) => (
            <article className="history-row" key={entry.id}>
              <span className="history-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <button
                className="history-main"
                type="button"
                onClick={() => onSelect(entry)}
              >
                <span className="history-date">
                  {new Intl.DateTimeFormat("zh-CN", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(entry.createdAt))}
                </span>
                <h2>
                  {entry.aName}
                  <i>against</i>
                  {entry.bName}
                </h2>
                <p>{entry.data.verdict}</p>
              </button>
              <button
                className="history-remove"
                type="button"
                aria-label={`删除 ${entry.aName} 与 ${entry.bName} 的对比记录`}
                onClick={() => onRemove(entry.id)}
              >
                <Icon name="trash" size={15} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingScreen({
  stage,
  linkA,
  linkB,
}: {
  stage: number;
  linkA: string;
  linkB: string;
}) {
  return (
    <section className="page-shell loading-screen" aria-live="polite">
      <div className="loading-copy">
        <p className="eyebrow">Researching / Public Sources</p>
        <h1>{analysisStages[stage]}</h1>
        <p>把产品信息、成分、价格和公开口碑放进同一套判断标准。</p>
      </div>
      <div className="loading-progress">
        {analysisStages.map((item, index) => (
          <div
            className={
              index < stage ? "is-complete" : index === stage ? "is-active" : ""
            }
            key={item}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
      <div className="loading-sources">
        <span>A / {getHostLabel(linkA)}</span>
        <i />
        <span>B / {getHostLabel(linkB)}</span>
      </div>
    </section>
  );
}

export function MirraApp() {
  const [screen, setScreen] = useState<Screen>("compare");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [transitionId, setTransitionId] = useState(0);
  const [linkA, setLinkA] = useState("");
  const [linkB, setLinkB] = useState("");
  const [result, setResult] = useState<ComparisonData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const currentScreenRef = useRef<Screen>("compare");
  const loadingStartedAt = useRef(0);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const saved = loadHistory();
    setHistory(saved);

    const initial = parseScreen();
    if (initial.startsWith("result/") && saved[0]) {
      setResult(saved[0].data);
    }
    setScreen(initial === "loading" ? "compare" : initial);
    currentScreenRef.current = initial === "loading" ? "compare" : initial;

    if (!window.location.hash) {
      window.history.replaceState({ mirra: true }, "", screenHashes.compare);
    }

    const handleHashChange = () => {
      const next = parseScreen();
      const normalized = next === "loading" ? "compare" : next;
      setDirection(
        screenRank(normalized) >= screenRank(currentScreenRef.current)
          ? "forward"
          : "back",
      );
      setScreen(normalized);
      currentScreenRef.current = normalized;
      setTransitionId((value) => value + 1);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (screen !== "loading") return;
    setStage(0);
    const interval = window.setInterval(() => {
      setStage((current) =>
        Math.min(current + 1, analysisStages.length - 1),
      );
    }, 1_650);
    return () => window.clearInterval(interval);
  }, [screen]);

  const navigate = useCallback(
    (next: Screen, mode: "push" | "replace" = "push") => {
      setDirection(
        screenRank(next) >= screenRank(currentScreenRef.current)
          ? "forward"
          : "back",
      );
      const hash = screenHashes[next];
      if (mode === "replace") {
        window.history.replaceState({ mirra: true }, "", hash);
      } else if (window.location.hash !== hash) {
        window.history.pushState({ mirra: true }, "", hash);
      }
      setScreen(next);
      currentScreenRef.current = next;
      setTransitionId((value) => value + 1);
    },
    [],
  );

  const onBack = useCallback(() => {
    navigate(screen.startsWith("result/") ? "compare" : "compare");
  }, [navigate, screen]);

  const analyze = async () => {
    setError("");
    if (
      getLinkStatus(linkA).status === "short" ||
      getLinkStatus(linkB).status === "short"
    ) {
      setError(
        "检测到手机 App 分享短链。请先在商品页打开目标商品，再复制电脑端地址栏中的完整链接。",
      );
      return;
    }
    if (!isValidUrl(linkA) || !isValidUrl(linkB)) {
      setError("请先分别粘贴两个有效的商品链接。");
      return;
    }
    if (linkA.trim() === linkB.trim()) {
      setError("两个链接相同，请换一个商品再对比。");
      return;
    }

    loadingStartedAt.current = Date.now();
    navigate("loading");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          a: linkA.trim(),
          b: linkB.trim(),
          turnstileToken,
        }),
      });
      const payload = (await response.json()) as
        | ComparisonData
        | { error?: string };

      if (!response.ok || !("products" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "分析暂时失败，请稍后再试。",
        );
      }

      const elapsed = Date.now() - loadingStartedAt.current;
      if (elapsed < 1_800) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, 1_800 - elapsed),
        );
      }

      setResult(payload);
      setHistory(saveComparison(payload));
      setTurnstileToken("");
      setTurnstileResetKey((current) => current + 1);
      navigate("result/overview", "replace");
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "分析暂时失败，请稍后再试。",
      );
      setTurnstileResetKey((current) => current + 1);
      navigate("compare", "replace");
    }
  };

  const resultSection = screen.startsWith("result/")
    ? (screen.split("/")[1] as ResultSection)
    : null;

  return (
    <div className="site-frame">
      <SiteHeader screen={screen} onNavigate={navigate} onBack={onBack} />

      <main className="view-stage">
        <div
          className={`view-frame view-${direction}`}
          key={`${screen}-${transitionId}`}
        >
          {screen === "compare" && (
            <CompareScreen
              linkA={linkA}
              linkB={linkB}
              error={error}
              onLinkA={setLinkA}
              onLinkB={setLinkB}
              onUseSample={() => {
                setLinkA(sampleLinks.a);
                setLinkB(sampleLinks.b);
                setError("");
              }}
              onSubmit={analyze}
              turnstileSiteKey={turnstileSiteKey}
              turnstileToken={turnstileToken}
              turnstileResetKey={turnstileResetKey}
              onTurnstileToken={setTurnstileToken}
            />
          )}
          {screen === "history" && (
            <HistoryScreen
              entries={history}
              onSelect={(entry) => {
                setResult(entry.data);
                setLinkA(entry.data.links.a);
                setLinkB(entry.data.links.b);
                navigate("result/overview");
              }}
              onRemove={(id) => setHistory(removeHistoryEntry(id))}
              onClear={() => {
                clearHistory();
                setHistory([]);
              }}
              onCompare={() => navigate("compare")}
            />
          )}
          {screen === "loading" && (
            <LoadingScreen stage={stage} linkA={linkA} linkB={linkB} />
          )}
          {resultSection && result && (
            <ComparisonResult
              data={result}
              section={resultSection}
              onNewCompare={() => navigate("compare")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
