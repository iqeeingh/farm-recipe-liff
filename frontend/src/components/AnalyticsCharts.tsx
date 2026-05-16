import {
  DailyEventStat,
  DailyMethodStat,
  DailyProductStat,
  DailyRecipeStat,
  DailySceneStat,
} from "../types";

interface AnalyticsChartsProps {
  methodStats: DailyMethodStat[];
  recipeStats: DailyRecipeStat[];
  productStats: DailyProductStat[];
  sceneStats: DailySceneStat[];
  eventStats: DailyEventStat[];
}

interface BarDatum {
  label: string;
  value: number;
}

interface LineDatum {
  label: string;
  value: number;
}

function aggregateTopItems<T>(
  items: T[],
  getLabel: (item: T) => string,
  getValue: (item: T) => number,
  limit = 8,
): BarDatum[] {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    const label = getLabel(item).trim();
    if (!label) {
      return;
    }

    totals.set(label, (totals.get(label) ?? 0) + getValue(item));
  });

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function aggregateDailyTrend(items: DailyEventStat[]): LineDatum[] {
  const totals = new Map<string, number>();

  items.forEach((item) => {
    totals.set(item.date, (totals.get(item.date) ?? 0) + item.count);
  });

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function EmptyChart({ message }: { message: string }) {
  return <div className="chart-empty">{message}</div>;
}

function BarChart({ title, items, suffix }: { title: string; items: BarDatum[]; suffix: string }) {
  const maxValue = items.reduce((max, item) => Math.max(max, item.value), 0);

  return (
    <article className="chart-panel">
      <div className="chart-heading">
        <h3>{title}</h3>
      </div>
      {items.length === 0 ? (
        <EmptyChart message="目前沒有統計資料" />
      ) : (
        <div className="bar-chart">
          {items.map((item) => (
            <div key={item.label} className="bar-row">
              <div className="bar-row-labels">
                <span className="bar-row-label">{item.label}</span>
                <span className="bar-row-value">
                  {item.value.toLocaleString("zh-TW")}
                  {suffix}
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function LineChart({ title, items }: { title: string; items: LineDatum[] }) {
  if (items.length === 0) {
    return (
      <article className="chart-panel">
        <div className="chart-heading">
          <h3>{title}</h3>
        </div>
        <EmptyChart message="目前沒有統計資料" />
      </article>
    );
  }

  const width = 640;
  const height = 260;
  const padding = 28;
  const maxValue = items.reduce((max, item) => Math.max(max, item.value), 0) || 1;
  const stepX = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0;

  const points = items.map((item, index) => {
    const x = padding + index * stepX;
    const y = height - padding - (item.value / maxValue) * (height - padding * 2);
    return { ...item, x, y };
  });

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <article className="chart-panel">
      <div className="chart-heading">
        <h3>{title}</h3>
      </div>
      <div className="line-chart-shell">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label={title}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="chart-axis" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="chart-axis" />
          <path d={path} className="line-path" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="4" className="line-point" />
              <text x={point.x} y={height - 8} textAnchor="middle" className="chart-label">
                {point.label.slice(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </article>
  );
}

export function AnalyticsCharts({
  methodStats,
  recipeStats,
  productStats,
  sceneStats,
  eventStats,
}: AnalyticsChartsProps) {
  const topMethods = aggregateTopItems(methodStats, (item) => item.method, (item) => item.count);
  const topRecipes = aggregateTopItems(recipeStats, (item) => item.recipeName || item.recipeId, (item) => item.viewCount);
  const topProducts = aggregateTopItems(
    productStats,
    (item) => item.productName || item.productId,
    (item) => item.productClickCount,
  );
  const topScenes = aggregateTopItems(sceneStats, (item) => item.sceneTag, (item) => item.count);
  const dailyTrend = aggregateDailyTrend(eventStats);

  return (
    <section className="analytics-chart-grid">
      <BarChart title="料理方式排行" items={topMethods} suffix=" 次" />
      <BarChart title="食譜瀏覽排行" items={topRecipes} suffix=" 次" />
      <BarChart title="商品點擊排行" items={topProducts} suffix=" 次" />
      <BarChart title="情境標籤排行" items={topScenes} suffix=" 次" />
      <LineChart title="每日事件趨勢" items={dailyTrend} />
    </section>
  );
}
