import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Main compound lifts
  const exercises = [
    {
      name: "Bench Press",
      category: "compound",
      muscleGroup: "chest",
      isMain: true,
    },
    {
      name: "Squat",
      category: "compound",
      muscleGroup: "legs",
      isMain: true,
    },
    {
      name: "Deadlift",
      category: "compound",
      muscleGroup: "back",
      isMain: true,
    },
    {
      name: "Overhead Press",
      category: "compound",
      muscleGroup: "shoulders",
      isMain: true,
    },
    // Secondary compound lifts
    {
      name: "Incline Bench Press",
      category: "compound",
      muscleGroup: "chest",
      isMain: false,
    },
    {
      name: "Front Squat",
      category: "compound",
      muscleGroup: "legs",
      isMain: false,
    },
    {
      name: "Sumo Deadlift",
      category: "compound",
      muscleGroup: "back",
      isMain: false,
    },
    {
      name: "Romanian Deadlift",
      category: "compound",
      muscleGroup: "legs",
      isMain: false,
    },
    // Accessory exercises
    {
      name: "Barbell Row",
      category: "compound",
      muscleGroup: "back",
      isMain: false,
    },
    {
      name: "Dumbbell Row",
      category: "accessory",
      muscleGroup: "back",
      isMain: false,
    },
    {
      name: "Pull-ups",
      category: "compound",
      muscleGroup: "back",
      isMain: false,
    },
    {
      name: "Lat Pulldown",
      category: "accessory",
      muscleGroup: "back",
      isMain: false,
    },
    {
      name: "Dumbbell Press",
      category: "accessory",
      muscleGroup: "chest",
      isMain: false,
    },
    {
      name: "Cable Flyes",
      category: "accessory",
      muscleGroup: "chest",
      isMain: false,
    },
    {
      name: "Leg Press",
      category: "compound",
      muscleGroup: "legs",
      isMain: false,
    },
    {
      name: "Leg Curl",
      category: "accessory",
      muscleGroup: "legs",
      isMain: false,
    },
    {
      name: "Leg Extension",
      category: "accessory",
      muscleGroup: "legs",
      isMain: false,
    },
    {
      name: "Lunges",
      category: "compound",
      muscleGroup: "legs",
      isMain: false,
    },
    {
      name: "Lateral Raises",
      category: "accessory",
      muscleGroup: "shoulders",
      isMain: false,
    },
    {
      name: "Face Pulls",
      category: "accessory",
      muscleGroup: "shoulders",
      isMain: false,
    },
    {
      name: "Barbell Curl",
      category: "accessory",
      muscleGroup: "arms",
      isMain: false,
    },
    {
      name: "Tricep Extension",
      category: "accessory",
      muscleGroup: "arms",
      isMain: false,
    },
    {
      name: "Dips",
      category: "compound",
      muscleGroup: "arms",
      isMain: false,
    },
    {
      name: "Close Grip Bench",
      category: "compound",
      muscleGroup: "arms",
      isMain: false,
    },
    {
      name: "Ab Wheel",
      category: "accessory",
      muscleGroup: "core",
      isMain: false,
    },
    {
      name: "Planks",
      category: "accessory",
      muscleGroup: "core",
      isMain: false,
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }

  console.log(`Seeded ${exercises.length} exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
