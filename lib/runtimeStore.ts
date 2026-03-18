export type ReviewSession = {
  originalFileName: string;
  cleanFileName: string;
  hash: string;
  pageCount: number;
  redactionCount: number;
  cleanPdfDataUrl: string;
  createdAt: string;
  estimatedWitnessFeesFound: number;
};

const REVIEW_SESSION_STORAGE_KEY = "notary-tool-review-session-v2";

let currentReviewSession: ReviewSession | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setReviewSession(session: ReviewSession) {
  currentReviewSession = session;

  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    REVIEW_SESSION_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export function getReviewSession() {
  if (currentReviewSession) {
    return currentReviewSession;
  }

  if (!canUseStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(REVIEW_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ReviewSession;
    currentReviewSession = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function clearReviewSession() {
  currentReviewSession = null;

  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(REVIEW_SESSION_STORAGE_KEY);
}
