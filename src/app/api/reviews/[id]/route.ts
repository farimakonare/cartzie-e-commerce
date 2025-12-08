import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const review = await prisma.review.findUnique({
    where: { review_id: Number(id) },
    include: { user: true, product: true },
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json(review);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.review.update({
    where: { review_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.review.delete({ where: { review_id: Number(id) } });
  return NextResponse.json({ message: "Review deleted" });
}
