import { BodyMetric, PersonalRecord } from "@prisma/client";

export interface WeightPRCorrelation {
  date: Date;
  bodyWeight: number;
  pr: number;
  estimatedMax: number;
  strengthToWeightRatio: number;
  wilksScore?: number;
}

export interface AnalyticsData {
  correlations: WeightPRCorrelation[];
  averageStrengthToWeight: number;
  trend: "increasing" | "decreasing" | "stable";
  bestRatio: WeightPRCorrelation | null;
  currentRatio: WeightPRCorrelation | null;
}

/**
 * Calculate Wilks score for powerlifting total
 * Formula for men - adjust coefficients for women if needed
 */
export function calculateWilksScore(
  bodyWeightKg: number,
  totalKg: number,
  isMale: boolean = true
): number {
  const coefficients = isMale
    ? {
        a: -216.0475144,
        b: 16.2606339,
        c: -0.002388645,
        d: -0.00113732,
        e: 7.01863e-6,
        f: -1.291e-8,
      }
    : {
        a: 594.31747775582,
        b: -27.23842536447,
        c: 0.82112226871,
        d: -0.00930733913,
        e: 4.731582e-5,
        f: -9.054e-8,
      };

  const x = bodyWeightKg;
  const denominator =
    coefficients.a +
    coefficients.b * x +
    coefficients.c * Math.pow(x, 2) +
    coefficients.d * Math.pow(x, 3) +
    coefficients.e * Math.pow(x, 4) +
    coefficients.f * Math.pow(x, 5);

  return (500 * totalKg) / denominator;
}

/**
 * Analyze correlation between body weight and PRs over time
 */
export function analyzeWeightPRCorrelation(
  bodyMetrics: BodyMetric[],
  personalRecords: PersonalRecord[]
): AnalyticsData {
  // Sort both arrays by date
  const sortedMetrics = [...bodyMetrics].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const sortedPRs = [...personalRecords].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const correlations: WeightPRCorrelation[] = [];

  // Match each PR with the closest body weight measurement
  sortedPRs.forEach((pr) => {
    const closestMetric = findClosestMetric(pr.date, sortedMetrics);
    if (closestMetric) {
      const strengthToWeightRatio = pr.estimatedMax / closestMetric.weight;
      correlations.push({
        date: pr.date,
        bodyWeight: closestMetric.weight,
        pr: pr.weight,
        estimatedMax: pr.estimatedMax,
        strengthToWeightRatio,
      });
    }
  });

  // Calculate average strength-to-weight ratio
  const averageStrengthToWeight =
    correlations.length > 0
      ? correlations.reduce((sum, c) => sum + c.strengthToWeightRatio, 0) /
        correlations.length
      : 0;

  // Determine trend
  const trend = calculateTrend(correlations);

  // Find best and current ratios
  const bestRatio =
    correlations.length > 0
      ? correlations.reduce((best, current) =>
          current.strengthToWeightRatio > best.strengthToWeightRatio
            ? current
            : best
        )
      : null;

  const currentRatio =
    correlations.length > 0 ? correlations[correlations.length - 1] : null;

  return {
    correlations,
    averageStrengthToWeight,
    trend,
    bestRatio,
    currentRatio,
  };
}

/**
 * Find the closest body metric to a given date (within 7 days)
 */
function findClosestMetric(
  targetDate: Date,
  metrics: BodyMetric[]
): BodyMetric | null {
  let closest: BodyMetric | null = null;
  let smallestDiff = Infinity;

  metrics.forEach((metric) => {
    const diff = Math.abs(metric.date.getTime() - targetDate.getTime());
    const daysDiff = diff / (1000 * 60 * 60 * 24);

    // Only consider metrics within 7 days
    if (daysDiff <= 7 && diff < smallestDiff) {
      smallestDiff = diff;
      closest = metric;
    }
  });

  return closest;
}

/**
 * Calculate trend based on recent data points
 */
function calculateTrend(
  correlations: WeightPRCorrelation[]
): "increasing" | "decreasing" | "stable" {
  if (correlations.length < 3) return "stable";

  // Take last 5 data points or all if less than 5
  const recentData = correlations.slice(-5);
  const ratios = recentData.map((c) => c.strengthToWeightRatio);

  // Simple linear regression
  const n = ratios.length;
  const xSum = (n * (n + 1)) / 2; // Sum of indices (1, 2, 3, ...)
  const ySum = ratios.reduce((sum, val) => sum + val, 0);
  const xySum = ratios.reduce((sum, val, idx) => sum + val * (idx + 1), 0);
  const xSquareSum = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);

  // Threshold for considering a trend
  const threshold = 0.01;

  if (slope > threshold) return "increasing";
  if (slope < -threshold) return "decreasing";
  return "stable";
}

/**
 * Calculate body composition change over time
 */
export function analyzeBodyComposition(
  metrics: BodyMetric[]
): {
  weightChange: number;
  fatMassChange: number;
  leanMassChange: number;
  trend: "gaining" | "losing" | "maintaining";
} {
  if (metrics.length < 2) {
    return {
      weightChange: 0,
      fatMassChange: 0,
      leanMassChange: 0,
      trend: "maintaining",
    };
  }

  const sorted = [...metrics].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const weightChange = last.weight - first.weight;

  let fatMassChange = 0;
  let leanMassChange = 0;

  if (first.bodyFatPct && last.bodyFatPct) {
    const firstFatMass = first.weight * (first.bodyFatPct / 100);
    const lastFatMass = last.weight * (last.bodyFatPct / 100);
    fatMassChange = lastFatMass - firstFatMass;

    const firstLeanMass = first.weight - firstFatMass;
    const lastLeanMass = last.weight - lastFatMass;
    leanMassChange = lastLeanMass - firstLeanMass;
  }

  let trend: "gaining" | "losing" | "maintaining" = "maintaining";
  if (weightChange > 2) trend = "gaining";
  else if (weightChange < -2) trend = "losing";

  return {
    weightChange,
    fatMassChange,
    leanMassChange,
    trend,
  };
}

/**
 * Generate insights and recommendations based on analytics
 */
export function generateInsights(analytics: AnalyticsData): string[] {
  const insights: string[] = [];

  if (analytics.currentRatio && analytics.bestRatio) {
    const currentRatio = analytics.currentRatio.strengthToWeightRatio;
    const bestRatio = analytics.bestRatio.strengthToWeightRatio;

    if (currentRatio >= bestRatio * 0.95) {
      insights.push(
        "You're at or near your best strength-to-weight ratio! Great work!"
      );
    } else if (currentRatio < bestRatio * 0.85) {
      insights.push(
        "Your strength-to-weight ratio has decreased. Consider adjusting your diet or training volume."
      );
    }
  }

  if (analytics.trend === "increasing") {
    insights.push(
      "Your relative strength is improving over time. Keep up the good work!"
    );
  } else if (analytics.trend === "decreasing") {
    insights.push(
      "Your relative strength is trending down. Review your recovery and nutrition."
    );
  }

  if (analytics.correlations.length > 10) {
    const recentCorrelations = analytics.correlations.slice(-5);
    const avgBodyWeight =
      recentCorrelations.reduce((sum, c) => sum + c.bodyWeight, 0) /
      recentCorrelations.length;
    const avgMax =
      recentCorrelations.reduce((sum, c) => sum + c.estimatedMax, 0) /
      recentCorrelations.length;

    insights.push(
      `Recent average: ${avgBodyWeight.toFixed(1)} lbs with ${avgMax.toFixed(
        0
      )} lbs estimated max`
    );
  }

  return insights;
}
