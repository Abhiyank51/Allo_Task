import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Concurrency Test...");

  // Find the product with only 1 unit available (Product 5 from seed)
  const product = await prisma.product.findFirst({
    where: { sku: "MED-SCALPEL-TEST" },
    include: { inventories: true },
  });

  if (!product) {
    console.error("Test product not found. Did you run the seed script?");
    process.exit(1);
  }

  const inventory = product.inventories[0];

  console.log(`Testing with Product: ${product.name}`);
  console.log(`Warehouse: ${inventory.warehouseId}`);
  console.log(`Available Units: ${inventory.totalUnits - inventory.reservedUnits}`);

  if (inventory.totalUnits - inventory.reservedUnits !== 1) {
    console.error("Available units must be exactly 1 for this test to be meaningful.");
    process.exit(1);
  }

  console.log("Firing 10 concurrent reservation requests for the last unit...");

  const CONCURRENT_REQUESTS = 10;
  
  const promises = Array.from({ length: CONCURRENT_REQUESTS }).map(async (_, i) => {
    try {
      const res = await fetch("http://localhost:3000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: inventory.warehouseId,
          quantity: 1,
        }),
      });
      const data = await res.json();
      return { status: res.status, data };
    } catch (e: any) {
      return { status: 500, error: e.message };
    }
  });

  const results = await Promise.all(promises);

  const successes = results.filter(r => r.status === 201);
  const conflicts = results.filter(r => r.status === 409);
  const others = results.filter(r => r.status !== 201 && r.status !== 409);

  console.log("\nResults:");
  console.log(`Successes (201): ${successes.length}`);
  console.log(`Conflicts (409): ${conflicts.length}`);
  console.log(`Others: ${others.length}`);

  if (successes.length === 1 && conflicts.length === CONCURRENT_REQUESTS - 1) {
    console.log("\n✅ CONCURRENCY TEST PASSED! Exactly one request succeeded and the rest were rejected.");
  } else {
    console.log("\n❌ CONCURRENCY TEST FAILED! Expected 1 success and 9 conflicts.");
  }

  console.log("\nDetails (HTTP Status Codes):");
  console.log(JSON.stringify(results.map(r => r.status), null, 2));
}

main().catch(console.error);
