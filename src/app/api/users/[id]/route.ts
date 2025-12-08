import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// Get one user
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { user_id: Number(id) },
      include: {
        orders: true,
        payments: true,
        reviews: true,
        cart: { include: { cartItems: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user info
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { user_id: Number(id) },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.user.delete({
      where: { user_id: Number(id) }
    });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
