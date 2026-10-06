export function formatObsScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

export function formatObsDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

export type ObsLean = "positive" | "zero" | "negative";

export function computeObsLean(
  totalScore: number,
  voteCount: number,
): ObsLean {
  if (voteCount === 0) {
    return "zero";
  }
  const ratio = totalScore / (voteCount * 3);
  const clamped = Math.max(-1, Math.min(1, ratio));
  if (clamped > 0.05) {
    return "positive";
  }
  if (clamped < -0.05) {
    return "negative";
  }
  return "zero";
}

export function leanFillPercent(
  totalScore: number,
  voteCount: number,
): number {
  if (voteCount === 0) {
    return 50;
  }
  const ratio = totalScore / (voteCount * 3);
  const clamped = Math.max(-1, Math.min(1, ratio));
  return 50 + clamped * 50;
}

export function sortObsTeams<T extends { totalScore: number; orderId: number }>(
  teams: T[],
): T[] {
  return [...teams].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.orderId - b.orderId;
  });
}
