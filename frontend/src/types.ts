export const METHOD_OPTIONS = [
  "全部",
  "煎",
  "涼拌",
  "炸",
  "滷",
  "烤",
  "氣炸",
  "煮湯",
  "快速料理",
  "小孩愛吃",
  "下酒菜",
] as const;

export type MethodFilter = (typeof METHOD_OPTIONS)[number];

export interface Recipe {
  id: string;
  productId: string;
  recipeName: string;
  productName: string;
  category: string;
  intro: string;
  method: Exclude<MethodFilter, "全部">[];
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  productUrl: string;
}

export interface RecipeApiResponse {
  ok: boolean;
  data: unknown;
  error?: string;
}

export type RecipeEventType =
  | "page_view"
  | "click_method"
  | "search_keyword"
  | "view_recipe"
  | "click_product";

export interface RecipeEventPayload {
  lineUserId?: string;
  visitorId: string;
  eventType: RecipeEventType;
  method?: string;
  keyword?: string;
  category?: string;
  productId?: string;
  productName?: string;
  recipeId?: string;
  recipeName?: string;
}

export interface LiffBootstrapState {
  isLiffReady: boolean;
  isInClient: boolean;
  isLoggedIn: boolean;
  error: string | null;
  lineUserId: string | null;
  visitorId: string;
}
