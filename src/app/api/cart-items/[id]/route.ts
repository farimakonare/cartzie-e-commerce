import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const item = await prisma.cartItem.findUnique({
    where: { cart_item_id: Number(params.id) },
    include: { product: true, cart: true },
  });
  if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.cartItem.update({
    where: { cart_item_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.cartItem.delete({ where: { cart_item_id: Number(params.id) } });
  return NextResponse.json({ message: "Cart item deleted" });
}
