// api/orders/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// Get single order with all relationships
export async function GET(_req: Request, { params }: Params) {
  try {
    const order = await prisma.order.findUnique({
      where: { order_id: Number(params.id) },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
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

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// Update order (mainly for status updates)
export async function PUT(req: Request, { params }: Params) {
  try {
    const data = await req.json();
    
    const updated = await prisma.order.update({
      where: { order_id: Number(params.id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Delete order (with cascading deletes)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    // Delete related records first if not using cascade
    await prisma.orderItem.deleteMany({
      where: { order_id: Number(params.id) },
    });

    await prisma.shipment.deleteMany({
      where: { order_id: Number(params.id) },
    });

    await prisma.payment.deleteMany({
      where: { order_id: Number(params.id) },
    });

    // Delete the order
    await prisma.order.delete({
      where: { order_id: Number(params.id) },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
