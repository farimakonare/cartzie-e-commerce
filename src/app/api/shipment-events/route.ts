import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { shipment_id, status, note } = await req.json();
    if (!shipment_id || !status) {
      return NextResponse.json(
        { error: "shipment_id and status are required" },
        { status: 400 }
      );
    }

    const event = await prisma.shipmentEvent.create({
      data: {
        shipment_id,
        status,
        note,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating shipment event:", error);
    return NextResponse.json(
      { error: "Failed to create shipment event" },
      { status: 500 }
    );
  }
}
