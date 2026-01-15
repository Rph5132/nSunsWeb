import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await prisma.bodyMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(metrics);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { weight, bodyFatPct, muscleMass, waist, chest, arms, legs, notes } =
      body;

    const metric = await prisma.bodyMetric.create({
      data: {
        userId: session.user.id,
        weight: parseFloat(weight),
        bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        waist: waist ? parseFloat(waist) : null,
        chest: chest ? parseFloat(chest) : null,
        arms: arms ? parseFloat(arms) : null,
        legs: legs ? parseFloat(legs) : null,
        notes,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Error creating body metric:", error);
    return NextResponse.json(
      { error: "Failed to create body metric" },
      { status: 500 }
    );
  }
}
