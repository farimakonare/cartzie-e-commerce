import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const carts = await prisma.cart.findMany({
    include: { user: true, cartItems: { include: { product: true } } },
  });
  return NextResponse.json(carts);
}

export async function POST(req: Request) {
  const data = await req.json();
  const cart = await prisma.cart.create({ data });
  return NextResponse.json(cart, { status: 201 });
}
