import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// Get one product
export async function GET(_req: Request, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { product_id: Number(params.id) },
    include: {
      category: true,
      reviews: true,
      orderItems: true,
      cartItems: true,
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

// Update product
export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.product.update({
    where: { product_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

// Delete product
export async function DELETE(_req: Request, { params }: Params) {
  await prisma.product.delete({ where: { product_id: Number(params.id) } });
  return NextResponse.json({ message: "Product deleted successfully" });
}
