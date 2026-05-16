import liff from "@line/liff";
import { LiffBootstrapState } from "./types";

const VISITOR_ID_STORAGE_KEY = "farmaroundyou.visitorId";

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId(): string {
  const fallbackId = createVisitorId();

  if (typeof window === "undefined") {
    return fallbackId;
  }

  try {
    const existingId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)?.trim();

    if (existingId) {
      return existingId;
    }

    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, fallbackId);
    return fallbackId;
  } catch {
    return fallbackId;
  }
}

const DEFAULT_STATE: LiffBootstrapState = {
  isLiffReady: false,
  isInClient: false,
  isLoggedIn: false,
  error: null,
  lineUserId: null,
  visitorId: getVisitorId(),
};

export async function initializeLiff(): Promise<LiffBootstrapState> {
  const liffId = import.meta.env.VITE_LIFF_ID;
  const visitorId = getVisitorId();

  if (!liffId) {
    return {
      ...DEFAULT_STATE,
      visitorId,
      error: "VITE_LIFF_ID 未設定，已使用一般瀏覽器模式。",
    };
  }

  try {
    await liff.init({ liffId });
    const isInClient = liff.isInClient();
    const isLoggedIn = liff.isLoggedIn();
    let lineUserId: string | null = null;

    if (isLoggedIn) {
      try {
        const profile = await liff.getProfile();
        lineUserId = profile.userId;
      } catch {
        lineUserId = null;
      }
    }

    return {
      isLiffReady: true,
      isInClient,
      isLoggedIn,
      error: null,
      lineUserId,
      visitorId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "LIFF 初始化失敗，已使用一般瀏覽器模式。";

    return {
      ...DEFAULT_STATE,
      visitorId,
      error: message,
    };
  }
}
