// app/api/habits/[id]/log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ Await the context.params to avoid Next.js 15 sync params error
  const { id } = await context.params;
  const habitId = Number(id);

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isNaN(habitId)) {
    return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check habit ownership
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.userId !== user.id) {
    return NextResponse.json({ error: "Habit not found or unauthorized" }, { status: 404 });
  }

  // Set date to today's start
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prevent duplicate logs for today
  const existingLog = await prisma.habitLog.findFirst({
    where: {
      habitId,
      date: today,
    },
  });

  if (existingLog) {
    return NextResponse.json({ message: "Already logged today" }, { status: 409 });
  }

  // Create a new log
  await prisma.habitLog.create({
    data: {
      habitId,
      date: today,
    },
  });

  return NextResponse.json({ message: "Habit logged for today" }, { status: 201 });
}
