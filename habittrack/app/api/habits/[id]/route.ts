import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Helper to get the updated habit list
async function getUserHabits(userId: number) {
  return await prisma.habit.findMany({
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== user.id) {
    return NextResponse.json(
      { error: "Habit not found or unauthorized" },
      { status: 404 }
    );
  }

  const data = await req.json();
  const { title, description } = data;
  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Title is required and must be a string" },
      { status: 400 }
    );
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: { title, description: description || null },
  });

  const updatedHabits = await getUserHabits(user.id);
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== user.id) {
    return NextResponse.json(
      { error: "Habit not found or unauthorized" },
      { status: 404 }
    );
  }

  await prisma.habit.delete({ where: { id: habitId } });

  const updatedHabits = await getUserHabits(user.id);
  return NextResponse.json(updatedHabits);
}
