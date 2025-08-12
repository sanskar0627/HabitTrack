import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { logs: true },
  });

  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, reminderEnabled, reminderTime } = await req.json();

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (reminderEnabled && (!reminderTime || typeof reminderTime !== "string")) {
    return NextResponse.json({ error: "Reminder time must be provided" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.habit.create({
    data: {
      title,
      description,
      reminderEnabled: Boolean(reminderEnabled),
      reminderTime: reminderTime || null,
      userId: user.id,
    },
  });

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    include: { logs: true },
  });

  return NextResponse.json(habits);
}
