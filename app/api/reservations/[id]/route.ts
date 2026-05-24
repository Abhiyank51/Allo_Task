import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { product: true, warehouse: true } // Added relations for richer UI
    });

    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Failed to fetch reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
