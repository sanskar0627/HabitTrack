// app/api/reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to: string, subject: string, text: string) {
  await resend.emails.send({
    from: "Habit Tracker <sanskar0627@gmail.com>",
    to,
    subject,
    text,
  });
}

export async function GET(req: NextRequest) {
  // Check Authorization header for CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm

    // Fetch habits with reminder enabled at current time
    const habits = await prisma.habit.findMany({
      where: { reminderEnabled: true, reminderTime: currentTime },
      include: { user: true },
    });

    if (habits.length === 0) {
      return NextResponse.json({ message: "No reminders to send now" });
    }

    // Send emails
    for (const habit of habits) {
      await sendEmail(
        habit.user.email,
        `Reminder: Time to work on your habit "${habit.title}"!`,
        `Hi ${habit.user.name || "there"},\n\nIt's time to work on your habit: "${habit.title}". Keep going and build your streak!\n\nCheers,\nHabit Tracker Team`
      );
    }

    return NextResponse.json({ sent: habits.length });
  } catch (error) {
    console.error("Reminder sending failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
