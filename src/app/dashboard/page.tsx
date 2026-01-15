import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bodyMetrics: {
        orderBy: { date: "desc" },
        take: 30,
      },
      personalRecords: {
        orderBy: { date: "desc" },
        take: 50,
        include: {
          exercise: true,
        },
      },
      workouts: {
        orderBy: { date: "desc" },
        take: 10,
        include: {
          sets: {
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return <DashboardClient user={user} />;
}
