import { useEffect, useState } from "react";
import {
  fetchAnalyticsSummary,
  fetchDailyEventStats,
  fetchDailyMethodStats,
  fetchDailyProductStats,
  fetchDailyRecipeStats,
  fetchDailySceneStats,
} from "../api";
import { AnalyticsCards } from "../components/AnalyticsCards";
import { AnalyticsCharts } from "../components/AnalyticsCharts";
import {
  AnalyticsSummary,
  DailyEventStat,
  DailyMethodStat,
  DailyProductStat,
  DailyRecipeStat,
  DailySceneStat,
} from "../types";

const DAY_OPTIONS = [7, 30, 90, 180, 365] as const;

const EMPTY_SUMMARY: AnalyticsSummary = {
  days: 30,
  totalEvents: 0,
  recipeViews: 0,
  productClicks: 0,
  topMethod: null,
  topRecipe: null,
  topProduct: null,
};

export function AnalyticsPage() {
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(30);
  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [methodStats, setMethodStats] = useState<DailyMethodStat[]>([]);
  const [recipeStats, setRecipeStats] = useState<DailyRecipeStat[]>([]);
  const [productStats, setProductStats] = useState<DailyProductStat[]>([]);
  const [sceneStats, setSceneStats] = useState<DailySceneStat[]>([]);
  const [eventStats, setEventStats] = useState<DailyEventStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    void Promise.all([
      fetchAnalyticsSummary(days),
      fetchDailyMethodStats(days),
      fetchDailyRecipeStats(days),
      fetchDailyProductStats(days),
      fetchDailySceneStats(days),
      fetchDailyEventStats(days),
    ])
      .then(([summaryData, methodData, recipeData, productData, sceneData, eventData]) => {
        if (!active) {
          return;
        }

        setSummary(summaryData);
        setMethodStats(methodData);
        setRecipeStats(recipeData);
        setProductStats(productData);
        setSceneStats(sceneData);
        setEventStats(eventData);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setSummary({ ...EMPTY_SUMMARY, days });
        setMethodStats([]);
        setRecipeStats([]);
        setProductStats([]);
        setSceneStats([]);
        setEventStats([]);
        setError(loadError instanceof Error ? loadError.message : "分析資料載入失敗，請稍後再試。");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [days]);

  return (
    <main className="app-shell analytics-shell">
      <section className="hero-panel analytics-hero">
        <p className="eyebrow">Farmaroundyou Analytics</p>
        <h1>食譜行為儀表板</h1>
        <p className="hero-copy">快速查看料理偏好、商品點擊意圖與近期互動趨勢。</p>
      </section>

      <section className="analytics-toolbar">
        <div className="section-heading">
          <h2>觀察區間</h2>
          <span>{days} 天</span>
        </div>
        <div className="chip-row">
          {DAY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={option === days ? "chip chip-active" : "chip"}
              onClick={() => setDays(option)}
            >
              {option}天
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <section className="notice-panel" role="alert">
          {error}
        </section>
      ) : null}

      {isLoading ? (
        <section className="loading-state">
          <p>分析資料載入中...</p>
        </section>
      ) : (
        <>
          <AnalyticsCards summary={summary} />
          <AnalyticsCharts
            methodStats={methodStats}
            recipeStats={recipeStats}
            productStats={productStats}
            sceneStats={sceneStats}
            eventStats={eventStats}
          />
        </>
      )}
    </main>
  );
}
