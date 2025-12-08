import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const payment = await prisma.payment.findUnique({
    where: { payment_id: Number(id) },
    include: {
      user: true,
      order: {
        include: {
          shipment: true,
          user: true,
        },
      },
    },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json(payment);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.payment.update({
    where: { payment_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.payment.delete({ where: { payment_id: Number(id) } });
  return NextResponse.json({ message: "Payment deleted" });
}
