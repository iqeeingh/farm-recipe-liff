import { AnalyticsSummary } from "../types";

interface AnalyticsCardsProps {
  summary: AnalyticsSummary;
}

const cards = [
  { key: "totalEvents", label: "總事件數" },
  { key: "recipeViews", label: "食譜瀏覽數" },
  { key: "productClicks", label: "商品點擊數" },
] as const;

export function AnalyticsCards({ summary }: AnalyticsCardsProps) {
  return (
    <section className="analytics-card-grid">
      {cards.map((card) => (
        <article key={card.key} className="analytics-card">
          <p className="analytics-card-label">{card.label}</p>
          <strong className="analytics-card-value">
            {summary[card.key].toLocaleString("zh-TW")}
          </strong>
        </article>
      ))}

      <article className="analytics-card analytics-card-wide">
        <p className="analytics-card-label">最熱門料理方式</p>
        <strong className="analytics-card-value">{summary.topMethod?.label ?? "暫無資料"}</strong>
        <span className="analytics-card-meta">
          {summary.topMethod ? `${summary.topMethod.count.toLocaleString("zh-TW")} 次` : "等待累積事件"}
        </span>
      </article>

      <article className="analytics-card analytics-card-wide">
        <p className="analytics-card-label">最熱門食譜</p>
        <strong className="analytics-card-value">{summary.topRecipe?.label ?? "暫無資料"}</strong>
        <span className="analytics-card-meta">
          {summary.topRecipe ? `${summary.topRecipe.count.toLocaleString("zh-TW")} 次瀏覽` : "等待累積事件"}
        </span>
      </article>

      <article className="analytics-card analytics-card-wide">
        <p className="analytics-card-label">最熱門商品</p>
        <strong className="analytics-card-value">{summary.topProduct?.label ?? "暫無資料"}</strong>
        <span className="analytics-card-meta">
          {summary.topProduct ? `${summary.topProduct.count.toLocaleString("zh-TW")} 次點擊` : "等待累積事件"}
        </span>
      </article>
    </section>
  );
}
