import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { releaseExpiredReservations } from "@/lib/cleanup-expired";

export async function GET(req: Request) {
  try {
    await releaseExpiredReservations();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const search = searchParams.get("search") || "";
    const warehouseId = searchParams.get("warehouseId") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (warehouseId && warehouseId !== "ALL") {
      where.inventories = {
        some: { warehouseId }
      };
    }

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: { inventories: { include: { warehouse: true } } },
      }),
      prisma.product.count({ where })
    ]);

    const data = products.map((product) => ({
      ...product,
      inventories: product.inventories.map((inv) => ({
        ...inv,
        availableUnits: inv.totalUnits - inv.reservedUnits,
      })),
    }));

    return NextResponse.json({
      data,
      metadata: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
