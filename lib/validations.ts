import { z } from "zod";

export const CreateReservationSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const ConfirmReservationSchema = z.object({
  id: z.string().uuid(),
});

export const ReleaseReservationSchema = z.object({
  id: z.string().uuid(),
});
