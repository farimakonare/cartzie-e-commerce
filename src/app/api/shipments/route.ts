import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shipments = await prisma.shipment.findMany({
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
  return NextResponse.json(shipments);
}

export async function POST(req: Request) {
  const data = await req.json();
  const shipment = await prisma.shipment.create({ data });
  return NextResponse.json(shipment, { status: 201 });
}
