import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.product.deleteMany()

  const w1 = await prisma.warehouse.create({ data: { name: 'Northeast Medical Hub', location: 'NY, USA' } })
  const w2 = await prisma.warehouse.create({ data: { name: 'West Coast Supplies', location: 'CA, USA' } })
  const w3 = await prisma.warehouse.create({ data: { name: 'Texas Central Fulfillment', location: 'TX, USA' } })

  const productsData = [
    { name: 'Digital Stethoscope Pro', sku: 'MED-01', price: 299.99, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Stethoscope' },
    { name: 'Clinical Pulse Oximeter', sku: 'MED-02', price: 149.50, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Pulse+Oximeter' },
    { name: 'N95 Surgical Masks', sku: 'MED-03', price: 49.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=N95+Masks' },
    { name: 'Portable Ultrasound', sku: 'MED-04', price: 1950.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Ultrasound' },
    { name: 'Emergency Defibrillator', sku: 'MED-05', price: 1200.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Defibrillator' },
    { name: 'CPAP Machine', sku: 'MED-06', price: 850.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=CPAP+Machine' },
    { name: 'Infrared Thermometer', sku: 'MED-07', price: 35.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Thermometer' },
    { name: 'Titanium Scalpel (Test)', sku: 'MED-SCALPEL-TEST', price: 199.99, image: 'https://placehold.co/600x400/991b1b/ffffff?text=Test+Scalpel' },
    { name: 'Surgical Gloves (Box)', sku: 'MED-09', price: 25.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Gloves' },
    { name: 'Hospital Bed (Electric)', sku: 'MED-10', price: 2500.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Hospital+Bed' },
    { name: 'IV Stand (Stainless)', sku: 'MED-11', price: 120.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=IV+Stand' },
    { name: 'Oxygen Cylinder (Portable)', sku: 'MED-12', price: 300.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Oxygen+Cylinder' },
    { name: 'Wheelchair (Lightweight)', sku: 'MED-13', price: 450.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Wheelchair' },
    { name: 'Blood Pressure Monitor', sku: 'MED-14', price: 85.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=BP+Monitor' },
    { name: 'Surgical Gowns (Pack)', sku: 'MED-15', price: 150.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=Surgical+Gowns' },
    { name: 'First Aid Kit (Trauma)', sku: 'MED-16', price: 220.00, image: 'https://placehold.co/600x400/0f766e/ffffff?text=First+Aid+Kit' },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        description: `Premium grade ${p.name} for clinical use.`,
        imageUrl: p.image,
        price: p.price,
      }
    });

    if (p.sku === 'MED-SCALPEL-TEST') {
      await prisma.inventory.create({ data: { productId: product.id, warehouseId: w1.id, totalUnits: 1, reservedUnits: 0 } });
    } else {
      await prisma.inventory.create({ data: { productId: product.id, warehouseId: w1.id, totalUnits: Math.floor(Math.random() * 100) + 10, reservedUnits: 0 } });
      await prisma.inventory.create({ data: { productId: product.id, warehouseId: w2.id, totalUnits: Math.floor(Math.random() * 100) + 10, reservedUnits: 0 } });
      await prisma.inventory.create({ data: { productId: product.id, warehouseId: w3.id, totalUnits: Math.floor(Math.random() * 100) + 10, reservedUnits: 0 } });
    }
  }

  console.log('Database seeded with 16 products successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
