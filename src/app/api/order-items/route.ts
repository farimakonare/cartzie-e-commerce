import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orderItems = await prisma.orderItem.findMany({
    include: { order: true, product: true },
  });
  return NextResponse.json(orderItems);
}

export async function POST(req: Request) {
  const data = await req.json();
  const orderItem = await prisma.orderItem.create({ data });
  return NextResponse.json(orderItem, { status: 201 });
}