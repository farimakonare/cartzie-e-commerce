import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteProductCascade } from "@/lib/productCleanup";

type Params = { params: { id: string } };

// Get one category
export async function GET(_req: Request, { params }: Params) {
  try {
    const category = await prisma.category.findUnique({
      where: { category_id: Number(params.id) },
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
export async function PUT(req: Request, { params }: Params) {
  try {
    const data = await req.json();
    const updated = await prisma.category.update({
      where: { category_id: Number(params.id) },
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
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const categoryId = Number(params.id);

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
