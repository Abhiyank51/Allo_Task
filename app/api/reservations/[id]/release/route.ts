import { NextResponse } from "next/server";
import { releaseReservation } from "@/lib/reservations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    try {
      const released = await releaseReservation(id);
      return NextResponse.json(released);
    } catch (e: any) {
      if (e.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
      }
      if (e.message === "ALREADY_CONFIRMED") {
        return NextResponse.json({ error: "Reservation was already confirmed" }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Failed to release reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
