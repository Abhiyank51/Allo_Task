import { NextResponse } from "next/server";
import { CreateReservationSchema } from "@/lib/validations";
import { createReservation } from "@/lib/reservations";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.product = {
        name: { contains: search, mode: "insensitive" }
      };
    }

    const [reservations, totalItems] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        include: { product: true, warehouse: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.reservation.count({ where })
    ]);

    return NextResponse.json({
      data: reservations,
      metadata: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
