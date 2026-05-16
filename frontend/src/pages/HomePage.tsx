import { MethodChips } from "../components/MethodChips";
import { RecipeCard } from "../components/RecipeCard";
import { SearchBar } from "../components/SearchBar";
import { MethodFilter, Recipe } from "../types";

interface HomePageProps {
  loadError: string | null;
  searchText: string;
  selectedMethod: MethodFilter;
  recipes: Recipe[];
  onSearchChange: (value: string) => void;
  onMethodChange: (value: MethodFilter) => void;
  onRecipeSelect: (recipe: Recipe) => void;
}

export function HomePage({
  loadError,
  searchText,
  selectedMethod,
  recipes,
  onSearchChange,
  onMethodChange,
  onRecipeSelect,
}: HomePageProps) {
  const hasSearchKeyword = searchText.trim().length > 0;
  const emptyStateTitle = hasSearchKeyword
    ? `找不到「${searchText.trim()}」相關食譜`
    : `目前還沒有「${selectedMethod}」類食譜`;

  const handleResetFilters = () => {
    onMethodChange("全部");
    onSearchChange("");
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Farmaroundyou LIFF</p>
        <h1>晃晃食譜助手</h1>
        <p className="hero-copy">快速找到適合你的料理靈感</p>
      </section>

      {loadError ? (
        <section className="notice-panel" role="alert">
          {loadError}
        </section>
      ) : null}

      <section className="filter-panel">
        <MethodChips selected={selectedMethod} onSelect={onMethodChange} />
        <SearchBar value={searchText} onChange={onSearchChange} />
      </section>

      <section className="list-panel">
        <div className="section-heading">
          <h2>推薦食譜</h2>
          <span>{recipes.length} 筆</span>
        </div>
        {recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.recipeId} recipe={recipe} onClick={onRecipeSelect} />
            ))}
          </div>
        ) : loadError ? (
          <div className="empty-state">
            <h2>目前無法載入食譜</h2>
            <p>請確認 `VITE_GAS_API_BASE` 與 GAS Web App 是否可正常存取。</p>
          </div>
        ) : (
          <div className="empty-state">
            <h2>{emptyStateTitle}</h2>
            <p>可以調整料理方式或搜尋條件，或先回到全部食譜重新瀏覽。</p>
            <button type="button" className="empty-state-button" onClick={handleResetFilters}>
              查看全部食譜
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
