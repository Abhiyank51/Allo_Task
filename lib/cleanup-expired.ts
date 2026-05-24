import prisma from "./prisma";

/**
 * Finds all pending reservations that have expired and releases them.
 * Returns the number of released reservations.
 */
export async function releaseExpiredReservations() {
  const now = new Date();

  // Find expired pending reservations
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
  });

  if (expiredReservations.length === 0) {
    return 0;
  }

  let releasedCount = 0;

  for (const reservation of expiredReservations) {
    // Attempt to release using a transaction to ensure safe decrement
    try {
      await prisma.$transaction(async (tx) => {
        // Check if it's still pending (prevent race conditions)
        const current = await tx.reservation.findUnique({
          where: { id: reservation.id },
        });

        if (current?.status === "PENDING" && current.expiresAt < now) {
          // 1. Release the reservation
          await tx.reservation.update({
            where: { id: reservation.id },
            data: {
              status: "RELEASED",
              releasedAt: now,
            },
          });

          // 2. Decrement reservedUnits in inventory
          await tx.inventory.update({
            where: {
              productId_warehouseId: {
                productId: reservation.productId,
                warehouseId: reservation.warehouseId,
              },
            },
            data: {
              reservedUnits: {
                decrement: reservation.quantity,
              },
            },
          });
          
          releasedCount++;
        }
      });
    } catch (error) {
      console.error(`Failed to release expired reservation ${reservation.id}:`, error);
    }
  }

  return releasedCount;
}
