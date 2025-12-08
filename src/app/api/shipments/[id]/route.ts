import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const shipment = await prisma.shipment.findUnique({
    where: { shipment_id: Number(params.id) },
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

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.shipment.update({
    where: { shipment_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.shipment.delete({ where: { shipment_id: Number(params.id) } });
  return NextResponse.json({ message: "Shipment deleted" });
}
