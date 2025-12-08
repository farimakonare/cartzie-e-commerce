import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const item = await prisma.cartItem.findUnique({
    where: { cart_item_id: Number(id) },
    include: { product: true, cart: true },
  });
  if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.cartItem.update({
    where: { cart_item_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.cartItem.delete({ where: { cart_item_id: Number(id) } });
  return NextResponse.json({ message: "Cart item deleted" });
}
