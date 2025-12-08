import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const shipment = await prisma.shipment.findUnique({
    where: { shipment_id: Number(id) },
    include: {
      order: {
        include: {
          user: true,
        },
      },
      events: {
        orderBy: { created_at: 'asc' },
      },
    },
  });
  if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const data = await req.json();
  const updated = await prisma.shipment.update({
    where: { shipment_id: Number(id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.shipment.delete({ where: { shipment_id: Number(id) } });
  return NextResponse.json({ message: "Shipment deleted" });
}
