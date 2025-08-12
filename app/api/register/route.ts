import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const body = await req.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  //esnure All the field are there
  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
    });
  }
  //finding user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  //check if email is already esxisted or not?
  if (existingUser) {
    return new Response(JSON.stringify({ error: "Email already exists" }), {
      status: 400,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  //creating User in DB
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
    },
  });

  return new Response(
    JSON.stringify({
      message: "User registered",
      user: { id: user.id, email: user.email },
    }),
    { status: 201 }
  );
}
