import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteProductCascade } from "@/lib/productCleanup";

type RouteContext = { params: Promise<{ id: string }> };

// Get one category
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { category_id: Number(id) },
      include: {
        products: true,
        _count: {
          select: { products: true }
        }
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// Update category
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const updated = await prisma.category.update({
      where: { category_id: Number(id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete category
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    const category = await prisma.category.findUnique({
      where: { category_id: categoryId },
      select: { products: { select: { product_id: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    for (const product of category.products) {
      await deleteProductCascade(product.product_id);
    }

    await prisma.category.delete({ where: { category_id: categoryId } });
    return NextResponse.json({
      message: "Category and associated products deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
