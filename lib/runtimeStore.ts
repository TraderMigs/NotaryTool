export type ReviewSession = {
  originalFileName: string;
  cleanFileName: string;
  hash: string;
  pageCount: number;
  redactionCount: number;
  createdAt: string;
  estimatedWitnessFeesFound: number;
  cleanPdfBase64: string;
};

export type DashboardStats = {
  totalDocuments: number;
  totalPages: number;
  totalRedactions: number;
  totalWitnessFeesFound: number;
  lastProcessedAt: string | null;
};

const REVIEW_SESSION_KEY = "notary-tool-review-session-v2";
const DASHBOARD_STATS_KEY = "notary-tool-dashboard-stats-v2";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getDefaultStats(): DashboardStats {
  return {
    totalDocuments: 0,
    totalPages: 0,
    totalRedactions: 0,
    totalWitnessFeesFound: 0,
    lastProcessedAt: null
  };
}

export function saveReviewSession(session: ReviewSession) {
  if (!isBrowser()) return;
  window.localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(session));
}

export function getReviewSession(): ReviewSession | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(REVIEW_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ReviewSession;
  } catch {
    return null;
  }
}

export function clearReviewSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(REVIEW_SESSION_KEY);
}

export function readDashboardStats(): DashboardStats {
  if (!isBrowser()) return getDefaultStats();

  const raw = window.localStorage.getItem(DASHBOARD_STATS_KEY);
  if (!raw) return getDefaultStats();

  try {
    return JSON.parse(raw) as DashboardStats;
  } catch {
    return getDefaultStats();
  }
}

export function saveDashboardStats(stats: DashboardStats) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DASHBOARD_STATS_KEY, JSON.stringify(stats));
}

export function addSessionToDashboard(session: ReviewSession) {
  const current = readDashboardStats();
  const next: DashboardStats = {
    totalDocuments: current.totalDocuments + 1,
    totalPages: current.totalPages + session.pageCount,
    totalRedactions: current.totalRedactions + session.redactionCount,
    totalWitnessFeesFound:
      current.totalWitnessFeesFound + session.estimatedWitnessFeesFound,
    lastProcessedAt: new Date().toISOString()
  };

  saveDashboardStats(next);
}
