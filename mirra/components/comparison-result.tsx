"use client";

import { useMemo, useState } from "react";

import { Icon } from "./icons";
import type {
  ComparisonData,
  DimensionGroup,
  DimensionKey,
  ProductProfile,
} from "@/lib/types";

export type ResultSection = "overview" | "compare" | "sources";

interface ComparisonResultProps {
  data: ComparisonData;
  section: ResultSection;
  onNewCompare: () => void;
}

const dimensionOptions: Array<{
  key: DimensionKey;
  label: string;
}> = [
  { key: "price", label: "价格" },
  { key: "ingredients", label: "成分" },
  { key: "benefits", label: "功效" },
  { key: "reputation", label: "口碑" },
];

const groupOrder: DimensionGroup[] = [
  "价格与定位",
  "成分与功效",
  "体验与口碑",
];

function ProductTicket({
  product,
  side,
}: {
  product: ProductProfile;
  side: "A" | "B";
}) {
  return (
    <article className={`product-ticket ticket-${side.toLowerCase()}`}>
      <div className="ticket-top">
        <span>{side}</span>
        <small>{product.brand}</small>
      </div>
      <div className="ticket-bottle" aria-hidden="true">
        <i />
      </div>
      <p>{product.category}</p>
      <h2>{product.name}</h2>
      <div className="ticket-price">
        <strong>{product.currentPrice}</strong>
        <span>{product.regularPrice}</span>
      </div>
    </article>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="tag-list">
      {tags.map((tag, index) => (
        <span className={`tag tag-${(index % 4) + 1}`} key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function Overview({ data }: { data: ComparisonData }) {
  return (
    <div className="result-overview result-scroll">
      <div className="result-heading">
        <div>
          <p className="screen-kicker">DECISION NOTE</p>
          <h1>这一轮，谁更适合你？</h1>
        </div>
        <span className={`mode-stamp ${data.mode}`}>
          {data.mode === "live" ? "实时检索" : "演示数据"}
        </span>
      </div>

      <div className="product-pair">
        <ProductTicket product={data.products.a} side="A" />
        <span className="pair-seam" aria-hidden="true">
          VS
        </span>
        <ProductTicket product={data.products.b} side="B" />
      </div>

      <article className="verdict-ticket">
        <div className="verdict-ticket-head">
          <span className="pin" aria-hidden="true" />
          <p>MIRRA 选购判断</p>
          <small>
            {new Intl.DateTimeFormat("zh-CN", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(data.createdAt))}
          </small>
        </div>
        <p>{data.verdict}</p>
        <div className="buyer-cards">
          <div>
            <span>A</span>
            <p>{data.whoBuys.a}</p>
          </div>
          <div>
            <span>B</span>
            <p>{data.whoBuys.b}</p>
          </div>
        </div>
      </article>

      <div className="tag-board">
        <div>
          <span>A</span>
          <Tags tags={data.products.a.tags} />
        </div>
        <div>
          <span>B</span>
          <Tags tags={data.products.b.tags} />
        </div>
      </div>

      <div className="insight-split">
        <section>
          <header>
            <Icon name="spark" size={16} />
            <h2>核心亮点</h2>
          </header>
          <div>
            <span>A</span>
            <ul>
              {data.products.a.pros.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span>B</span>
            <ul>
              {data.products.b.pros.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="caution">
          <header>
            <Icon name="alert" size={16} />
            <h2>避雷槽点</h2>
          </header>
          <div>
            <span>A</span>
            <ul>
              {data.products.a.cons.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span>B</span>
            <ul>
              {data.products.b.cons.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Compare({
  data,
}: {
  data: ComparisonData;
}) {
  const [enabled, setEnabled] = useState<Record<DimensionKey, boolean>>({
    price: true,
    ingredients: true,
    benefits: true,
    reputation: true,
  });

  const visibleRows = useMemo(
    () => data.rows.filter((row) => enabled[row.dimension]),
    [data.rows, enabled],
  );

  const toggleDimension = (dimension: DimensionKey) => {
    setEnabled((current) => {
      const enabledCount = Object.values(current).filter(Boolean).length;
      if (current[dimension] && enabledCount === 1) return current;
      return { ...current, [dimension]: !current[dimension] };
    });
  };

  return (
    <div className="result-compare">
      <div className="result-heading compact">
        <div>
          <p className="screen-kicker">DIFFERENCE LOG</p>
          <h1>真正不同的是这几项。</h1>
        </div>
        <span className="difference-count">
          {visibleRows.filter((row) => row.different).length}
          <small>处差异</small>
        </span>
      </div>

      <div className="dimension-switches" aria-label="对比维度开关">
        {dimensionOptions.map((option) => (
          <button
            className={enabled[option.key] ? "is-active" : ""}
            type="button"
            key={option.key}
            aria-pressed={enabled[option.key]}
            onClick={() => toggleDimension(option.key)}
          >
            <span className="switch-check">
              {enabled[option.key] && <Icon name="check" size={11} />}
            </span>
            {option.label}
          </button>
        ))}
      </div>

      <div className="compare-product-legend">
        <span>A {data.products.a.name}</span>
        <i>对比项</i>
        <span>B {data.products.b.name}</span>
      </div>

      <div className="comparison-rows">
        {groupOrder.map((group) => {
          const rows = visibleRows.filter((row) => row.group === group);
          if (rows.length === 0) return null;
          return (
            <section className="comparison-group" key={group}>
              <h2>{group}</h2>
              {rows.map((row) => (
                <article
                  className={`comparison-row ${
                    row.different ? "is-different" : "is-same"
                  }`}
                  key={row.id}
                >
                  <p>{row.a}</p>
                  <div>
                    <span className="row-letter">A</span>
                    <strong>{row.label}</strong>
                    {row.different && <i aria-label="存在差异" />}
                    <span className="row-letter">B</span>
                  </div>
                  <p>{row.b}</p>
                </article>
              ))}
            </section>
          );
        })}
      </div>
      <p className="compare-legend">
        <span />
        粉色标记代表两侧存在实质差异
      </p>
    </div>
  );
}

function Sources({
  data,
  onNewCompare,
}: {
  data: ComparisonData;
  onNewCompare: () => void;
}) {
  const priceClass =
    data.priceTrend.status === "近期低价"
      ? "is-good"
      : data.priceTrend.status === "价格偏高"
        ? "is-high"
        : "is-normal";

  return (
    <div className="result-sources result-scroll">
      <div className="result-heading compact">
        <div>
          <p className="screen-kicker">EVIDENCE FILE</p>
          <h1>每个判断，都留一条回去的路。</h1>
        </div>
      </div>

      <article className="price-slip">
        <div className={`price-seal ${priceClass}`}>
          <Icon name="trend" size={18} />
          {data.priceTrend.status}
        </div>
        <p>{data.priceTrend.summary}</p>
        <time dateTime={data.priceTrend.checkedAt}>
          检索于{" "}
          {new Intl.DateTimeFormat("zh-CN", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(data.priceTrend.checkedAt))}
        </time>
      </article>

      <section className="source-file">
        <header>
          <span>公开来源</span>
          <strong>{data.sources.length}</strong>
        </header>
        {data.sources.map((source, index) => (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            key={`${source.url}-${index}`}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{source.title}</p>
            <Icon name="external" size={15} />
          </a>
        ))}
      </section>

      <p className="disclaimer">{data.disclaimer}</p>
      <button
        className="button-secondary new-compare"
        type="button"
        onClick={onNewCompare}
      >
        开始新的对比
        <Icon name="arrow-right" size={15} />
      </button>
    </div>
  );
}

export function ComparisonResult({
  data,
  section,
  onNewCompare,
}: ComparisonResultProps) {
  if (section === "compare") return <Compare data={data} />;
  if (section === "sources") {
    return <Sources data={data} onNewCompare={onNewCompare} />;
  }
  return <Overview data={data} />;
}
