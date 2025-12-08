import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const cart = await prisma.cart.findUnique({
    where: { cart_id: Number(params.id) },
    include: { user: true, cartItems: { include: { product: true } } },
  });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  return NextResponse.json(cart);
}

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.cart.update({
    where: { cart_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.cart.delete({ where: { cart_id: Number(params.id) } });
  return NextResponse.json({ message: "Cart deleted" });
}
