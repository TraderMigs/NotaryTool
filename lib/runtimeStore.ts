export type ReviewSession = {
  sessionId: string;
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

const REVIEW_SESSION_KEY = "notary-tool-review-session-v3";
const DASHBOARD_STATS_KEY = "notary-tool-dashboard-stats-v3";
const PROCESSED_SESSION_IDS_KEY = "notary-tool-processed-session-ids-v3";

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

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveReviewSession(session: ReviewSession) {
  if (!isBrowser()) return;
  window.localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(session));
}

export function getReviewSession(): ReviewSession | null {
  if (!isBrowser()) return null;

  const session = safeJsonParse<ReviewSession | null>(
    window.localStorage.getItem(REVIEW_SESSION_KEY),
    null
  );

  if (!session) return null;

  if (!session.sessionId) {
    return {
      ...session,
      sessionId: createSessionId()
    } as ReviewSession;
  }

  return session;
}

export function clearReviewSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(REVIEW_SESSION_KEY);
}

export function readDashboardStats(): DashboardStats {
  if (!isBrowser()) return getDefaultStats();

  return safeJsonParse<DashboardStats>(
    window.localStorage.getItem(DASHBOARD_STATS_KEY),
    getDefaultStats()
  );
}

export function saveDashboardStats(stats: DashboardStats) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DASHBOARD_STATS_KEY, JSON.stringify(stats));
}

function readProcessedSessionIds(): string[] {
  if (!isBrowser()) return [];

  const ids = safeJsonParse<string[]>(
    window.localStorage.getItem(PROCESSED_SESSION_IDS_KEY),
    []
  );

  return Array.isArray(ids) ? ids : [];
}

function saveProcessedSessionIds(ids: string[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PROCESSED_SESSION_IDS_KEY, JSON.stringify(ids));
}

export function hasSessionBeenRecorded(sessionId: string) {
  return readProcessedSessionIds().includes(sessionId);
}

export function addSessionToDashboard(session: ReviewSession) {
  if (hasSessionBeenRecorded(session.sessionId)) {
    return false;
  }

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
  saveProcessedSessionIds([...readProcessedSessionIds(), session.sessionId]);
  return true;
}
