# Allo Health - Multi-Warehouse Inventory Fulfillment Demo

**[🚀 View Live Deployment on Vercel](https://allo-task-nine.vercel.app/)** *(Live deployment)*

An enterprise-grade, concurrency-safe inventory reservation and order-fulfillment platform built for multi-warehouse retail. This application solves the critical D2C race condition where thousands of concurrent shoppers attempt to purchase the exact same physical unit during high-traffic sales.

---

## 📸 System Previews

*(Replace the placeholder links below with your actual screenshot URLs)*

| Storefront & Search | Admin Inventory Dashboard | Supabase Architecture |
| :---: | :---: | :---: |
| ![Storefront Placeholder](https://placehold.co/600x400/0f766e/ffffff?text=Storefront+Screenshot) | ![Admin Dashboard Placeholder](https://placehold.co/600x400/0f766e/ffffff?text=Admin+Dashboard+Screenshot) | ![Supabase Placeholder](https://placehold.co/600x400/0f766e/ffffff?text=Supabase+Tables+Screenshot) |

---

## ⚡ Core Architecture: Concurrency & Race Conditions

The absolute core of this exercise is guaranteeing that **exactly one request succeeds** when two customers try to buy the last unit of a SKU simultaneously.

### The Problem
If we decrement stock at the time of payment, two users might pass the initial checkout check, pay simultaneously, and one will require a manual refund (bad UX, high ops overhead).

### The Solution: Atomic Reservations
This platform solves this by temporarily reserving stock using a 10-minute hold window. 
To guarantee race-condition safety, the reservation logic uses a raw, atomic PostgreSQL query rather than relying on standard ORM read-then-write logic (which is vulnerable to race conditions):

```sql
UPDATE "Inventory" 
SET "reservedUnits" = "reservedUnits" + {quantity}
WHERE "totalUnits" - "reservedUnits" >= {quantity}
```
If the query returns `0` affected rows, the system knows the stock was claimed microseconds earlier and safely returns a `409 Conflict`. 

*Note: You can test this exact scenario by running `npm run test:concurrency` in the terminal, which fires 10 simultaneous requests at the exact same millisecond. Exactly 1 will succeed, and 9 will receive 409s.*

---

## ⏱️ Expiry Mechanism in Production

To prevent abandoned carts from permanently depleting inventory, reservations automatically expire after 10 minutes.

**In this application, expiry is handled via a two-pronged approach:**
1. **Lazy Cleanup on Read:** Every time the storefront (`GET /api/products`) is accessed, a lightweight, non-blocking asynchronous script sweeps the database for any `PENDING` reservations where `expiresAt < NOW()`. It instantly marks them as `EXPIRED` and returns the stock to the available pool. This ensures the frontend *always* shows perfectly accurate inventory data without waiting for a scheduled cron job.
2. **Vercel Cron Job:** For production redundancy, a serverless Cron job runs periodically hitting `/api/cron/release-expired` to clean up orphaned holds during periods of low traffic, ensuring database hygiene.

---

## 🛠️ Trade-offs & Future Improvements (If I Had More Time)

1. **Idempotency Keys:** Currently, if a user's network drops during confirmation and their device retries the request, it could theoretically throw an error. I would implement `Idempotency-Key` headers using Upstash Redis to securely cache and return the original successful response without repeating the database side effect.
2. **Pessimistic Locking vs Atomic Updates:** I chose atomic `UPDATE...WHERE` statements because they are incredibly fast and completely eliminate race conditions without locking the entire row. However, for a massive global system, implementing Redis distributed locks (using Redlock) before touching the primary database might reduce load during highly-contended flash sales.
3. **Event-Driven Architecture:** Right now, the Confirm/Release endpoints operate synchronously. In a true enterprise environment, the `POST /confirm` route would instantly publish a `ReservationConfirmed` event to an AWS SQS queue or Kafka topic, allowing downstream warehouse systems to pick it up asynchronously.

---

## 💻 How to Run Locally

### 1. Prerequisites
- Node.js 18+
- A Supabase account (or any hosted Postgres database)

### 2. Environment Setup
Create a `.env` file in the root directory and add your Supabase connection strings. *(Do not commit this file!)*

```env
# Connect to Supabase via connection pooling with Supavisor.
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Direct connection to the database. Used for migrations.
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres"

# Used to securely authorize the cron job
CRON_SECRET="allo-health-secret"
```

### 3. Installation & Database Migration
Run the following commands to install dependencies, push the schema to Supabase, and seed the database with test products and warehouses.

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) to view the live inventory dashboard.
