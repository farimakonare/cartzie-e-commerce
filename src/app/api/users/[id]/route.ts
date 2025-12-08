import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// Get one user
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: Number(params.id) },
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
export async function PUT(req: Request, { params }: Params) {
  try {
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { user_id: Number(params.id) },
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
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.user.delete({
      where: { user_id: Number(params.id) }
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