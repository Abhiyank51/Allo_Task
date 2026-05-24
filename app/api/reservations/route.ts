import { NextResponse } from "next/server";
import { CreateReservationSchema } from "@/lib/validations";
import { createReservation } from "@/lib/reservations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { productId, warehouseId, quantity } = parsed.data;

    try {
      const reservation = await createReservation(productId, warehouseId, quantity);
      return NextResponse.json(reservation, { status: 201 });
    } catch (e: any) {
      if (e.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json({ error: "Not enough stock available" }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
