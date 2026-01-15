import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(workouts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dayType, weekNumber, notes, sets } = body;

    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        dayType,
        weekNumber: parseInt(weekNumber) || 1,
        notes,
        completed: false,
        sets: {
          create: sets.map((set: any) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: parseFloat(set.weight),
            rpe: set.rpe ? parseFloat(set.rpe) : null,
            isWarmup: set.isWarmup || false,
            completed: set.completed || false,
          })),
        },
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
