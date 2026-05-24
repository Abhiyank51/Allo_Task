import prisma from "./prisma";
import { ReservationStatus } from "@prisma/client";

export async function createReservation(productId: string, warehouseId: string, quantity: number) {
  return await prisma.$transaction(async (tx) => {
    // Attempt to reserve units using atomic update
    // We increment reservedUnits only if (totalUnits - reservedUnits) >= quantity
    const updateResult = await tx.$executeRaw`
      UPDATE "Inventory"
      SET "reservedUnits" = "reservedUnits" + ${quantity},
          "updatedAt" = NOW()
      WHERE "productId" = ${productId} 
        AND "warehouseId" = ${warehouseId}
        AND "totalUnits" - "reservedUnits" >= ${quantity}
    `;

    // updateResult contains the number of affected rows
    if (updateResult === 0) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    // Since the atomic update succeeded, create the Reservation row
    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const reservation = await tx.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: ReservationStatus.PENDING,
        expiresAt,
      },
    });

    return reservation;
  });
}

export async function confirmReservation(id: string) {
  return await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error("NOT_FOUND");
    }

    if (reservation.status === "CONFIRMED") {
      return reservation; // Idempotent success
    }

    if (reservation.status === "RELEASED") {
      throw new Error("ALREADY_RELEASED");
    }

    const now = new Date();
    if (reservation.expiresAt < now) {
      throw new Error("EXPIRED");
    }

    // Mark as confirmed
    const confirmed = await tx.reservation.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: now,
      },
    });

    // Permanently decrement both totalUnits and reservedUnits
    await tx.inventory.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      },
      data: {
        totalUnits: { decrement: reservation.quantity },
        reservedUnits: { decrement: reservation.quantity },
      },
    });

    return confirmed;
  });
}

export async function releaseReservation(id: string) {
  return await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error("NOT_FOUND");
    }

    if (reservation.status === "RELEASED") {
      return reservation; // Idempotent success
    }

    if (reservation.status === "CONFIRMED") {
      throw new Error("ALREADY_CONFIRMED");
    }

    // Mark as released
    const released = await tx.reservation.update({
      where: { id },
      data: {
        status: "RELEASED",
        releasedAt: new Date(),
      },
    });

    // Make stock available again by decrementing reservedUnits
    await tx.inventory.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      },
      data: {
        reservedUnits: { decrement: reservation.quantity },
      },
    });

    return released;
  });
}
