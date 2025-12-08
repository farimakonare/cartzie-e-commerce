import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get orders with optional user filtering
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where = userId ? { user_id: Number(userId) } : undefined;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { order_date: "desc" },
    include: {
      user: true,
      orderItems: { include: { product: true } },
      shipment: {
        include: {
          events: {
            orderBy: { created_at: "asc" },
          },
        },
      },
      payment: true,
    },
  });
  return NextResponse.json(orders);
}

// Create a new order
export async function POST(req: Request) {
  const data = await req.json();
  const order = await prisma.order.create({
    data,
    include: { orderItems: true },
  });
  return NextResponse.json(order, { status: 201 });
}

// Update order details
export async function PUT(req: Request) {
  const { order_id, ...data } = await req.json();
  const updated = await prisma.order.update({
    where: { order_id },
    data,
  });
  return NextResponse.json(updated);
}

// Cancel/delete an order
export async function DELETE(req: Request) {
  const { order_id } = await req.json();
  await prisma.order.delete({ where: { order_id } });
  return NextResponse.json({ message: "Order deleted" });
}
