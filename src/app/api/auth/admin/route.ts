import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findFirst({
      where: {
        user_email: email,
        user_password: password,
        role: "admin",
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const { user_password: _userPassword, ...safeAdmin } = admin;

    return NextResponse.json(safeAdmin);
  } catch (error) {
    console.error("Error during admin login:", error);
    return NextResponse.json(
      { error: "Unable to complete login at this time." },
      { status: 500 }
    );
  }
}
