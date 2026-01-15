-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "heightCm" REAL,
    "targetWeight" REAL,
    "programType" TEXT NOT NULL DEFAULT 'nSuns531'
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayType" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "rpe" REAL,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Set_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "reps" INTEGER NOT NULL,
    "estimatedMax" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" REAL NOT NULL,
    "bodyFatPct" REAL,
    "muscleMass" REAL,
    "waist" REAL,
    "chest" REAL,
    "arms" REAL,
    "legs" REAL,
    "notes" TEXT,
    CONSTRAINT "BodyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT NOT NULL,
    "weight" REAL,
    "notes" TEXT,
    "angle" TEXT,
    CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fats" REAL NOT NULL,
    CONSTRAINT "NutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Workout_userId_date_idx" ON "Workout"("userId", "date");

-- CreateIndex
CREATE INDEX "Set_workoutId_idx" ON "Set"("workoutId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_exerciseId_idx" ON "PersonalRecord"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "BodyMetric_userId_date_idx" ON "BodyMetric"("userId", "date");

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_date_idx" ON "ProgressPhoto"("userId", "date");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_date_idx" ON "NutritionLog"("userId", "date");
