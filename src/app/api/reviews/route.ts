import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { user: true, product: true },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const data = await req.json();
  const review = await prisma.review.create({ data });
  return NextResponse.json(review, { status: 201 });
}
