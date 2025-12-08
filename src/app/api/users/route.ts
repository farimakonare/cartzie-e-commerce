import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all users with computed stats for admin dashboard
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            total_amount: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Transform data to include computed fields
    const usersWithStats = users.map(user => ({
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_address: user.user_address,
      user_phone: user.user_phone,
      role: user.role,
      orders: user._count.orders,
      totalSpent: user.orders.reduce((sum, order) => sum + order.total_amount, 0),
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create a new user
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await prisma.user.create({ data });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
