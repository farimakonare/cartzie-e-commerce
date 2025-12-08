import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.cartItem.findMany({
    include: { product: true, cart: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const data = await req.json();
  const item = await prisma.cartItem.create({ data });
  return NextResponse.json(item, { status: 201 });
}
