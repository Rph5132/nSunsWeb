/**
 * nSuns 5/3/1 LP Program Calculator
 * Calculates training maxes and workout weights based on the nSuns program
 */

export interface TrainingMax {
  exercise: string;
  max: number;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  percentage: number;
  weight: number;
}

export interface WorkoutDay {
  dayType: string;
  mainExercise: string;
  secondaryExercise: string;
  mainSets: WorkoutSet[];
  secondarySets: WorkoutSet[];
}

// nSuns 5/3/1 percentages for main lifts (9 sets)
const MAIN_LIFT_PERCENTAGES = [
  { reps: 8, percentage: 0.75 },
  { reps: 6, percentage: 0.85 },
  { reps: 4, percentage: 0.95 },
  { reps: 4, percentage: 0.90 },
  { reps: 4, percentage: 0.85 },
  { reps: 5, percentage: 0.80 },
  { reps: 6, percentage: 0.75 },
  { reps: 7, percentage: 0.70 },
  { reps: 8, percentage: 0.65 },
];

// Secondary lift percentages (8 sets)
const SECONDARY_PERCENTAGES = [
  { reps: 6, percentage: 0.50 },
  { reps: 5, percentage: 0.60 },
  { reps: 3, percentage: 0.70 },
  { reps: 5, percentage: 0.70 },
  { reps: 7, percentage: 0.70 },
  { reps: 4, percentage: 0.70 },
  { reps: 6, percentage: 0.70 },
  { reps: 8, percentage: 0.70 },
];

/**
 * Calculate estimated 1 rep max using Epley formula
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Round weight to nearest 2.5 (or 5 if over 200)
 */
export function roundWeight(weight: number): number {
  const increment = weight > 200 ? 5 : 2.5;
  return Math.round(weight / increment) * increment;
}

/**
 * Generate workout sets for a specific exercise
 */
export function generateWorkoutSets(
  trainingMax: number,
  percentages: typeof MAIN_LIFT_PERCENTAGES
): WorkoutSet[] {
  return percentages.map((set, index) => ({
    setNumber: index + 1,
    reps: set.reps,
    percentage: set.percentage,
    weight: roundWeight(trainingMax * set.percentage),
  }));
}

/**
 * Get the nSuns 4-day program structure
 */
export function get4DayProgram(trainingMaxes: {
  bench: number;
  squat: number;
  deadlift: number;
  ohp: number;
}): WorkoutDay[] {
  return [
    {
      dayType: "bench",
      mainExercise: "Bench Press",
      secondaryExercise: "Overhead Press",
      mainSets: generateWorkoutSets(trainingMaxes.bench, MAIN_LIFT_PERCENTAGES),
      secondarySets: generateWorkoutSets(trainingMaxes.ohp, SECONDARY_PERCENTAGES),
    },
    {
      dayType: "squat",
      mainExercise: "Squat",
      secondaryExercise: "Sumo Deadlift",
      mainSets: generateWorkoutSets(trainingMaxes.squat, MAIN_LIFT_PERCENTAGES),
      secondarySets: generateWorkoutSets(trainingMaxes.deadlift, SECONDARY_PERCENTAGES),
    },
    {
      dayType: "ohp",
      mainExercise: "Overhead Press",
      secondaryExercise: "Incline Bench Press",
      mainSets: generateWorkoutSets(trainingMaxes.ohp, MAIN_LIFT_PERCENTAGES),
      secondarySets: generateWorkoutSets(trainingMaxes.bench, SECONDARY_PERCENTAGES),
    },
    {
      dayType: "deadlift",
      mainExercise: "Deadlift",
      secondaryExercise: "Front Squat",
      mainSets: generateWorkoutSets(trainingMaxes.deadlift, MAIN_LIFT_PERCENTAGES),
      secondarySets: generateWorkoutSets(trainingMaxes.squat, SECONDARY_PERCENTAGES),
    },
  ];
}

/**
 * Calculate new training max based on AMRAP set performance
 * If you hit the target reps, increase by 5 lbs (upper body) or 10 lbs (lower body)
 */
export function calculateNewTrainingMax(
  currentMax: number,
  amrapReps: number,
  targetReps: number,
  isLowerBody: boolean
): number {
  if (amrapReps >= targetReps + 2) {
    // Exceeded target by 2 or more
    return currentMax + (isLowerBody ? 15 : 10);
  } else if (amrapReps >= targetReps) {
    // Met target
    return currentMax + (isLowerBody ? 10 : 5);
  } else {
    // Did not meet target - no increase
    return currentMax;
  }
}

/**
 * Get progression recommendation based on workout performance
 */
export function getProgressionRecommendation(
  amrapReps: number,
  targetReps: number
): {
  shouldProgress: boolean;
  message: string;
  increment: number;
} {
  if (amrapReps >= targetReps + 3) {
    return {
      shouldProgress: true,
      message: "Excellent! Increase training max by 15 lbs (lower) or 10 lbs (upper)",
      increment: 15,
    };
  } else if (amrapReps >= targetReps + 1) {
    return {
      shouldProgress: true,
      message: "Good work! Increase training max by 10 lbs (lower) or 5 lbs (upper)",
      increment: 10,
    };
  } else if (amrapReps >= targetReps) {
    return {
      shouldProgress: true,
      message: "Met target. Increase training max by 5 lbs (lower) or 2.5 lbs (upper)",
      increment: 5,
    };
  } else {
    return {
      shouldProgress: false,
      message: "Keep working with current weights. Focus on form and recovery.",
      increment: 0,
    };
  }
}
