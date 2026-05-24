import { NextResponse } from "next/server";
import { confirmReservation } from "@/lib/reservations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    try {
      const confirmed = await confirmReservation(id);
      return NextResponse.json(confirmed);
    } catch (e: any) {
      if (e.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
      }
      if (e.message === "ALREADY_RELEASED") {
        return NextResponse.json({ error: "Reservation was already released" }, { status: 409 });
      }
      if (e.message === "EXPIRED") {
        return NextResponse.json({ error: "Reservation has expired" }, { status: 410 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Failed to confirm reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
