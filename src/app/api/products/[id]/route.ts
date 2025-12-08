import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteProductCascade } from "@/lib/productCleanup";

type RouteContext = { params: Promise<{ id: string }> };

// Get one product
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { product_id: Number(id) },
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
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.product.update({
    where: { product_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

// Delete product
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const productId = Number(id);
  try {
    await deleteProductCascade(productId);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
