import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const cart = await prisma.cart.findUnique({
    where: { cart_id: Number(id) },
    include: { user: true, cartItems: { include: { product: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  return NextResponse.json(cart);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.cart.update({
    where: { cart_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.cart.delete({ where: { cart_id: Number(id) } });
  return NextResponse.json({ message: "Cart deleted" });
}
