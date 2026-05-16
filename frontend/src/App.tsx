import { useEffect, useRef, useState } from "react";
import { fetchRecipes, logRecipeEvent } from "./api";
import { getVisitorId, initializeLiff } from "./liff";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { HomePage } from "./pages/HomePage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { LiffBootstrapState, MethodFilter, Recipe } from "./types";

const DEFAULT_LIFF_STATE: LiffBootstrapState = {
  isLiffReady: false,
  isInClient: false,
  isLoggedIn: false,
  error: null,
  lineUserId: null,
  visitorId: getVisitorId(),
};

function App() {
  const currentPage =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("page") : null;
  const isAnalyticsPage = currentPage === "analytics";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodFilter>("全部");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [liffState, setLiffState] = useState<LiffBootstrapState>(DEFAULT_LIFF_STATE);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [hasResolvedLiff, setHasResolvedLiff] = useState(false);
  const lastLoggedKeywordRef = useRef("");
  const hasLoggedPageViewRef = useRef(false);

  useEffect(() => {
    let active = true;

    void initializeLiff().then((state) => {
      if (active) {
        setLiffState(state);
        setLineUserId(state.lineUserId);
        setHasResolvedLiff(true);
      }
    });

    if (isAnalyticsPage) {
      setIsLoading(false);
    } else {
      void fetchRecipes()
        .then((items) => {
          if (active) {
            setRecipes(items);
            setLoadError(null);
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setRecipes([]);
            setSelectedRecipe(null);
            setLoadError(error instanceof Error ? error.message : "食譜載入失敗，請稍後再試。");
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [isAnalyticsPage]);

  useEffect(() => {
    if (hasLoggedPageViewRef.current || !hasResolvedLiff || !liffState.visitorId) {
      return;
    }

    hasLoggedPageViewRef.current = true;
    logRecipeEvent({
      lineUserId: lineUserId ?? undefined,
      visitorId: liffState.visitorId,
      eventType: "page_view",
    });
  }, [hasResolvedLiff, lineUserId, liffState.visitorId]);

  useEffect(() => {
    const keyword = searchText.trim();

    if (!keyword) {
      lastLoggedKeywordRef.current = "";
      return;
    }

    if (keyword === lastLoggedKeywordRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logRecipeEvent({
        lineUserId: lineUserId ?? undefined,
        visitorId: liffState.visitorId,
        eventType: "search_keyword",
        keyword,
        method: selectedMethod === "全部" ? undefined : selectedMethod,
      });
      lastLoggedKeywordRef.current = keyword;
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [lineUserId, liffState.visitorId, searchText, selectedMethod]);

  const filteredRecipes = recipes.filter((recipe) => {
    const keyword = searchText.trim().toLowerCase();
    const matchesMethod =
      selectedMethod === "全部" || recipe.method.includes(selectedMethod as Recipe["method"][number]);

    const matchesSearch =
      keyword.length === 0 ||
      [
        recipe.recipeName,
        recipe.productName,
        recipe.category,
        recipe.intro,
        recipe.method.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchesMethod && matchesSearch;
  });

  const handleMethodChange = (method: MethodFilter) => {
    setSelectedMethod(method);
    logRecipeEvent({
      lineUserId: lineUserId ?? undefined,
      visitorId: liffState.visitorId,
      eventType: "click_method",
      method,
    });
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    logRecipeEvent({
      lineUserId: lineUserId ?? undefined,
      visitorId: liffState.visitorId,
      eventType: "view_recipe",
      category: recipe.category,
      productId: recipe.productId,
      productName: recipe.productName,
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
    });
  };

  const handleProductClick = (recipe: Recipe) => {
    if (!recipe.productUrl || recipe.productUrl === "#") {
      return;
    }

    logRecipeEvent({
      lineUserId: lineUserId ?? undefined,
      visitorId: liffState.visitorId,
      eventType: "click_product",
      category: recipe.category,
      productId: recipe.productId,
      productName: recipe.productName,
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
    });

    const opened = window.open(recipe.productUrl, "_blank", "noopener,noreferrer");

    if (!opened) {
      window.location.href = recipe.productUrl;
    }
  };

  const handleSourceRecipeClick = (recipe: Recipe) => {
    if (!recipe.sourceUrl) {
      return;
    }

    logRecipeEvent({
      lineUserId: lineUserId ?? undefined,
      visitorId: liffState.visitorId,
      eventType: "click_source_recipe",
      category: recipe.category,
      productId: recipe.productId,
      productName: recipe.productName,
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
    });

    const opened = window.open(recipe.sourceUrl, "_blank", "noopener,noreferrer");

    if (!opened) {
      window.location.href = recipe.sourceUrl;
    }
  };

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="loading-state">
          <p>食譜資料載入中...</p>
        </section>
      </main>
    );
  }

  if (isAnalyticsPage) {
    return <AnalyticsPage />;
  }

  if (selectedRecipe) {
    return (
      <RecipeDetailPage
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onProductClick={handleProductClick}
        onSourceRecipeClick={handleSourceRecipeClick}
      />
    );
  }

  return (
    <HomePage
      loadError={loadError}
      searchText={searchText}
      selectedMethod={selectedMethod}
      recipes={filteredRecipes}
      onSearchChange={setSearchText}
      onMethodChange={handleMethodChange}
      onRecipeSelect={handleRecipeSelect}
    />
  );
}

export default App;
