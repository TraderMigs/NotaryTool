export type ReviewSession = {
  originalFileName: string;
  cleanFileName: string;
  hash: string;
  pageCount: number;
  redactionCount: number;
  cleanPdfUrl: string;
  createdAt: string;
  estimatedWitnessFeesFound: number;
};

let currentReviewSession: ReviewSession | null = null;

export function setReviewSession(session: ReviewSession) {
  currentReviewSession = session;
}

export function getReviewSession() {
  return currentReviewSession;
}

export function clearReviewSession() {
  currentReviewSession = null;
}
