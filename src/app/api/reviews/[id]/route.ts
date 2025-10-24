import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const review = await prisma.review.findUnique({
    where: { review_id: Number(params.id) },
    include: { user: true, product: true },
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json(review);
}

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.review.update({
    where: { review_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.review.delete({ where: { review_id: Number(params.id) } });
  return NextResponse.json({ message: "Review deleted" });
}
