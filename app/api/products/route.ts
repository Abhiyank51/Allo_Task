import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/cleanup-expired";

export async function GET() {
  try {
    // Lazily cleanup expired reservations before fetching
    await releaseExpiredReservations();

    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Map to include available stock
    const data = products.map((product) => ({
      ...product,
      inventories: product.inventories.map((inv) => ({
        ...inv,
        availableUnits: inv.totalUnits - inv.reservedUnits,
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
