# Allo Health Inventory Demo

An end-to-end inventory reservation and order-fulfillment demo for a multi-warehouse retail/D2C platform.

## Features
- **Concurrency-Safe Reservations**: Uses Postgres transactions and atomic updates to ensure race conditions are prevented. Even if 100 users try to buy the last unit simultaneously, exactly 1 will succeed.
- **Auto Expiration**: Reservations are held for 10 minutes. If not confirmed, they expire and stock is returned. This is handled by a Cron job and lazy evaluation.
- **Modern UI**: Built with Next.js 15, Tailwind CSS, shadcn/ui, and Framer Motion for a premium, fast, and animated UX.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- Supabase (PostgreSQL)
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Query

## Architecture & Data Model
- `Product`: Core product info (SKU, price)
- `Warehouse`: Fulfillment centers
- `Inventory`: Junction table tracking `totalUnits` and `reservedUnits` per product per warehouse.
- `Reservation`: Tracks pending, confirmed, and released orders.

**Concurrency Strategy**:
When reserving, we run an atomic raw SQL update inside a Prisma transaction:
```sql
UPDATE "Inventory" 
SET "reservedUnits" = "reservedUnits" + {qty} 
WHERE "productId" = {pId} AND "warehouseId" = {wId} 
AND "totalUnits" - "reservedUnits" >= {qty}
```
If 0 rows are affected, we know stock was insufficient, throwing a 409 error. This prevents overselling entirely.

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase connection strings.
3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```
4. **Run Server**:
   ```bash
   npm run dev
   ```

## Testing Concurrency
To prove the system is safe from race conditions, run:
```bash
npm run test:concurrency
```
This fires 10 simultaneous API requests trying to reserve the exact same last unit. You will see exactly 1 succeed and 9 rejected. (Ensure the dev server is running on port 3000 first).

## Deployment
1. Connect repo to Vercel.
2. Add `DATABASE_URL`, `DIRECT_URL`, and `CRON_SECRET` to Vercel environment variables.
3. Configure Vercel Cron in `vercel.json` to hit `/api/cron/release-expired`.
