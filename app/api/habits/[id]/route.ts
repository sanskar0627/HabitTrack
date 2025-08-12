import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Helper to get the updated habit list
async function getUserHabits(userId: number) {
  return prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { logs: true },
  });
}

export async function PUT(
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

  const { title, description, reminderEnabled, reminderTime } =
    await req.json();

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (reminderEnabled) {
    // Optional: validate time format HH:mm
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    if (!reminderTime || !timeRegex.test(reminderTime)) {
      return NextResponse.json(
        { error: "Valid reminder time must be provided" },
        { status: 400 }
      );
    }
  }

  // Get the user and habit in one ownership check
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, user: { email: session.user.email } },
    include: { user: true },
  });

  if (!habit) {
    return NextResponse.json(
      { error: "Habit not found or unauthorized" },
      { status: 404 }
    );
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: {
      title,
      description,
      reminderEnabled: Boolean(reminderEnabled),
      reminderTime: reminderTime || null,
    },
  });

  const updatedHabits = await getUserHabits(habit.userId);
  return NextResponse.json(updatedHabits);
}

export async function DELETE(
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

  // Fetch habit and ensure ownership
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, user: { email: session.user.email } },
    include: { user: true },
  });

  if (!habit) {
    return NextResponse.json(
      { error: "Habit not found or unauthorized" },
      { status: 404 }
    );
  }

  await prisma.habit.delete({ where: { id: habitId } });

  const updatedHabits = await getUserHabits(habit.userId);
  return NextResponse.json(updatedHabits);
}
