import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const payment = await prisma.payment.findUnique({
    where: { payment_id: Number(params.id) },
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

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const updated = await prisma.payment.update({
    where: { payment_id: Number(params.id) },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await prisma.payment.delete({ where: { payment_id: Number(params.id) } });
  return NextResponse.json({ message: "Payment deleted" });
}
