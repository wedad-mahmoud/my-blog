import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser });
    }

    const user = await prisma.user.create({
      data: {
        id,
        email,
        name: name || email.split("@")[0],
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء المستخدم" },
      { status: 500 }
    );
  }
}