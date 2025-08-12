import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habitId = Number(params.id);
  if (isNaN(habitId)) {
    return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
  }

  // Find user by email to get user id
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Confirm the habit belongs to the user
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== user.id) {
    return NextResponse.json({ error: "Habit not found or unauthorized" }, { status: 404 });
  }

  // Check if today's log already exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date: today,
    },
  });

  if (existingLog) {
    return NextResponse.json({ message: "Already logged today" }, { status: 409 });
  }

  // Create a new HabitLog entry for today
  await prisma.habitLog.create({
    data: {
      habitId,
      date: today,
    },
  });

  return NextResponse.json({ message: "Habit logged for today" }, { status: 201 });
}
