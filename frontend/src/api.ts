import { METHOD_OPTIONS, Recipe, RecipeApiResponse, RecipeEventPayload } from "./types";

const fallbackRecipes: Recipe[] = [
  {
    id: "soy-braised-chicken",
    productId: "chicken-drumstick",
    recipeName: "醬香滷雞腿",
    productName: "放山雞棒腿",
    category: "家常滷味",
    intro: "鹹香入味、拌飯很穩，適合平日晚餐一次做好。",
    method: ["滷", "快速料理", "小孩愛吃"],
    imageUrl:
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=900&q=80",
    ingredients: ["放山雞棒腿 4 支", "醬油 4 大匙", "蒜頭 6 瓣", "米酒 2 大匙"],
    steps: [
      "雞腿表面擦乾，先下鍋煎出香氣。",
      "加入蒜頭、醬油、米酒與適量清水，小火滷 18 分鐘。",
      "收汁到醬色均勻後起鍋。",
    ],
    tips: ["起鍋前浸泡 10 分鐘更入味。"],
    productUrl: "https://example.com/products/soy-braised-chicken",
  },
  {
    id: "pan-seared-pork",
    productId: "pork-shoulder-steak",
    recipeName: "香煎梅花豬排",
    productName: "台灣梅花豬排",
    category: "平底鍋料理",
    intro: "外層微焦、肉汁保留，搭配鹽與檸檬就很完整。",
    method: ["煎", "快速料理", "下酒菜"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    ingredients: ["梅花豬排 2 片", "鹽 1 小匙", "黑胡椒 適量", "橄欖油 1 大匙"],
    steps: [
      "豬排回溫後擦乾，雙面撒鹽與胡椒。",
      "熱鍋下油，中火各煎 2 至 3 分鐘。",
      "靜置 3 分鐘再切片。",
    ],
    tips: ["厚切豬排可先蓋鍋 1 分鐘幫助熟成。"],
    productUrl: "https://example.com/products/pan-seared-pork",
  },
  {
    id: "air-fryer-wings",
    productId: "split-wings",
    recipeName: "氣炸蒜香雞翅",
    productName: "去節雞翅",
    category: "氣炸鍋料理",
    intro: "蒜香明顯、表皮酥脆，聚餐很適合。",
    method: ["氣炸", "下酒菜"],
    imageUrl:
      "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80",
    ingredients: ["雞翅 10 支", "蒜末 2 大匙", "醬油 1 大匙", "蜂蜜 1 大匙"],
    steps: [
      "雞翅與蒜末、醬油、蜂蜜拌勻醃 20 分鐘。",
      "放入氣炸鍋 190 度 12 分鐘，中途翻面。",
      "表面上色後即可盛盤。",
    ],
    tips: ["想更脆可最後加炸 2 分鐘。"],
    productUrl: "https://example.com/products/air-fryer-wings",
  },
  {
    id: "crispy-fish",
    productId: "sea-bass-fillet",
    recipeName: "酥炸白身魚塊",
    productName: "無刺鱸魚切片",
    category: "酥炸料理",
    intro: "外酥內嫩，孩子接受度高，也適合做便當菜。",
    method: ["炸", "小孩愛吃"],
    imageUrl:
      "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=900&q=80",
    ingredients: ["鱸魚切片 300g", "地瓜粉 1 碗", "鹽 1/2 小匙", "白胡椒 少許"],
    steps: [
      "魚塊擦乾後用鹽與白胡椒抓醃。",
      "均勻沾上地瓜粉，靜置 5 分鐘反潮。",
      "下鍋炸至金黃後瀝油。",
    ],
    tips: ["二次回炸 30 秒可提升酥度。"],
    productUrl: "https://example.com/products/crispy-fish",
  },
  {
    id: "roasted-vegetables",
    productId: "seasonal-vegetable-box",
    recipeName: "香草烤時蔬盤",
    productName: "綜合時令蔬菜箱",
    category: "烤箱料理",
    intro: "色彩乾淨、操作簡單，適合搭配主食或肉類。",
    method: ["烤", "快速料理"],
    imageUrl:
      "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80",
    ingredients: ["綜合蔬菜 1 盒", "橄欖油 2 大匙", "海鹽 適量", "乾燥迷迭香 少許"],
    steps: [
      "蔬菜切成相近大小後拌油與調味。",
      "鋪平進烤箱，200 度烤 18 分鐘。",
      "取出後再撒少許海鹽。",
    ],
    tips: ["南瓜與馬鈴薯可切小塊避免熟度不均。"],
    productUrl: "https://example.com/products/roasted-vegetables",
  },
  {
    id: "corn-soup",
    productId: "native-chicken-cuts",
    recipeName: "玉米雞湯",
    productName: "土雞切塊",
    category: "暖胃湯品",
    intro: "湯頭清甜，煮一鍋就能照顧全家。",
    method: ["煮湯", "小孩愛吃"],
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    ingredients: ["土雞切塊 500g", "水果玉米 2 支", "薑片 4 片", "水 1500ml"],
    steps: [
      "雞肉汆燙後洗淨備用。",
      "鍋中加入所有材料，大火煮滾後轉小火 30 分鐘。",
      "起鍋前依口味補鹽。",
    ],
    tips: ["玉米切段後稍微拍裂，甜味更容易釋出。"],
    productUrl: "https://example.com/products/corn-soup",
  },
];

export function getApiBase(): string {
  return (import.meta.env.VITE_GAS_API_BASE ?? "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,|、/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function toMethodArray(value: unknown): Recipe["method"] {
  const methodOptions = new Set(METHOD_OPTIONS.filter((item) => item !== "全部"));
  const methods = toStringArray(value).filter(
    (item): item is Recipe["method"][number] => methodOptions.has(item as Recipe["method"][number]),
  );

  return methods.length > 0 ? methods : ["快速料理"];
}

function createRecipeId(recipeName: string, productName: string, index: number): string {
  const source = `${recipeName}-${productName}-${index}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return source || `recipe-${index}`;
}

function normalizeRecipe(value: unknown, index: number): Recipe {
  if (!isRecord(value)) {
    throw new Error(`第 ${index + 1} 筆食譜資料格式不正確。`);
  }

  const recipeName = toStringValue(value.recipeName);
  const productName = toStringValue(value.productName);

  if (!recipeName || !productName) {
    throw new Error(`第 ${index + 1} 筆食譜缺少 recipeName 或 productName。`);
  }

  return {
    id: toStringValue(value.id, createRecipeId(recipeName, productName, index)),
    productId: toStringValue(value.productId, ""),
    recipeName,
    productName,
    category: toStringValue(value.category, "未分類"),
    intro: toStringValue(value.intro, "尚未提供食譜介紹。"),
    method: toMethodArray(value.method),
    imageUrl: toStringValue(
      value.imageUrl,
      "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=900&q=80",
    ),
    ingredients: toStringArray(value.ingredients),
    steps: toStringArray(value.steps),
    tips: toStringArray(value.tips),
    productUrl: toStringValue(value.productUrl, "#"),
  };
}

function normalizeRecipeList(value: unknown): Recipe[] {
  if (!Array.isArray(value)) {
    throw new Error("API data 欄位不是陣列。");
  }

  return value.map(normalizeRecipe);
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const apiBase = getApiBase();

  if (!apiBase) {
    return fallbackRecipes;
  }

  let response: Response;

  try {
    response = await fetch(`${apiBase}?action=listRecipes`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `食譜 API 連線失敗：${error.message}`
        : "食譜 API 連線失敗，請稍後再試。",
    );
  }

  if (!response.ok) {
    throw new Error(`食譜 API 回應失敗（HTTP ${response.status}）。`);
  }

  let payload: RecipeApiResponse;

  try {
    payload = (await response.json()) as RecipeApiResponse;
  } catch {
    throw new Error("食譜 API 回傳的不是有效 JSON。");
  }

  if (!payload.ok) {
    throw new Error(payload.error?.trim() || "食譜 API 回傳失敗。");
  }

  return normalizeRecipeList(payload.data);
}

export function logRecipeEvent(event: RecipeEventPayload): void {
  const apiBase = getApiBase();

  if (!apiBase) {
    return;
  }

  const params = new URLSearchParams({
    action: "logEvent",
    visitorId: event.visitorId,
    eventType: event.eventType,
  });

  const optionalEntries: Array<[keyof RecipeEventPayload, string | undefined]> = [
    ["lineUserId", event.lineUserId],
    ["method", event.method],
    ["keyword", event.keyword],
    ["category", event.category],
    ["productId", event.productId],
    ["productName", event.productName],
    ["recipeId", event.recipeId],
    ["recipeName", event.recipeName],
  ];

  optionalEntries.forEach(([key, value]) => {
    if (value && value.trim().length > 0) {
      params.set(key, value);
    }
  });

  void fetch(`${apiBase}?${params.toString()}`, {
    method: "GET",
    mode: "no-cors",
    keepalive: true,
  }).catch((error: unknown) => {
    console.error("Recipe event logging failed.", error);
  });
}
