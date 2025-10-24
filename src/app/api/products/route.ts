import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch all products
export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      reviews: true,
      orderItems: true,
      cartItems: true,
    },
  });
  return NextResponse.json(products);
}

// Add a new product
export async function POST(req: Request) {
  const data = await req.json();
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
