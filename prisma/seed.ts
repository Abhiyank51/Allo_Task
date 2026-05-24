import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.reservation.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.product.deleteMany()

  // Create Warehouses
  const w1 = await prisma.warehouse.create({
    data: { name: 'Northeast Medical Hub', location: 'NY, USA' }
  })
  const w2 = await prisma.warehouse.create({
    data: { name: 'West Coast Supplies', location: 'CA, USA' }
  })
  const w3 = await prisma.warehouse.create({
    data: { name: 'Texas Central Fulfillment', location: 'TX, USA' }
  })

  // Create Products
  const p1 = await prisma.product.create({
    data: {
      name: 'Digital Stethoscope Pro',
      sku: 'MED-STETH-01',
      description: 'Advanced digital stethoscope with noise cancellation and recording capabilities.',
      imageUrl: 'https://images.unsplash.com/photo-1584982751601-97d883868ce8?w=800&q=80',
      price: 299.99,
    }
  })
  const p2 = await prisma.product.create({
    data: {
      name: 'Clinical Pulse Oximeter',
      sku: 'MED-OXI-PRO',
      description: 'Hospital-grade pulse oximeter for continuous blood oxygen monitoring.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      price: 149.50,
    }
  })
  const p3 = await prisma.product.create({
    data: {
      name: 'N95 Surgical Masks (Box of 50)',
      sku: 'MED-N95-50',
      description: 'NIOSH approved N95 surgical respirators for highest level protection.',
      imageUrl: 'https://images.unsplash.com/photo-1586942289659-45c110372df0?w=800&q=80',
      price: 49.00,
    }
  })
  const p4 = await prisma.product.create({
    data: {
      name: 'Portable Ultrasound Scanner',
      sku: 'MED-ULTRA-PORT',
      description: 'Handheld ultrasound scanner that connects to iOS and Android devices.',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
      price: 1950.00,
    }
  })
  const p5 = await prisma.product.create({
    data: {
      name: 'Emergency Defibrillator (AED)',
      sku: 'MED-AED-01',
      description: 'Automated external defibrillator with voice instructions for emergency response.',
      imageUrl: 'https://images.unsplash.com/photo-1596541223130-5d564415f0d4?w=800&q=80',
      price: 1200.00,
    }
  })
  const p6 = await prisma.product.create({
    data: {
      name: 'Medical Grade CPAP Machine',
      sku: 'MED-CPAP-X',
      description: 'Advanced auto-adjusting CPAP machine with heated humidifier.',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      price: 850.00,
    }
  })
  const p7 = await prisma.product.create({
    data: {
      name: 'Infrared Forehead Thermometer',
      sku: 'MED-THERM-IR',
      description: 'Non-contact clinical infrared thermometer with memory recall.',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1663045695029-79758cb020d5?w=800&q=80',
      price: 35.00,
    }
  })
  const p8 = await prisma.product.create({
    data: {
      name: 'Limited Edition Titanium Scalpel (Concurrency Test)',
      sku: 'MED-SCALPEL-TEST',
      description: 'Extremely rare surgical scalpel. Only 1 left in stock across all warehouses to test concurrency!',
      imageUrl: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&q=80',
      price: 199.99,
    }
  })

  // Create Inventory
  await prisma.inventory.create({ data: { productId: p1.id, warehouseId: w1.id, totalUnits: 50, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p1.id, warehouseId: w2.id, totalUnits: 30, reservedUnits: 0 } })
  
  await prisma.inventory.create({ data: { productId: p2.id, warehouseId: w1.id, totalUnits: 15, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p2.id, warehouseId: w3.id, totalUnits: 25, reservedUnits: 0 } })
  
  await prisma.inventory.create({ data: { productId: p3.id, warehouseId: w2.id, totalUnits: 500, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p3.id, warehouseId: w3.id, totalUnits: 1000, reservedUnits: 0 } })
  
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w1.id, totalUnits: 10, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w2.id, totalUnits: 10, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w3.id, totalUnits: 10, reservedUnits: 0 } })

  await prisma.inventory.create({ data: { productId: p5.id, warehouseId: w1.id, totalUnits: 5, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p5.id, warehouseId: w3.id, totalUnits: 2, reservedUnits: 0 } })

  await prisma.inventory.create({ data: { productId: p6.id, warehouseId: w2.id, totalUnits: 12, reservedUnits: 0 } })

  await prisma.inventory.create({ data: { productId: p7.id, warehouseId: w1.id, totalUnits: 150, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p7.id, warehouseId: w2.id, totalUnits: 200, reservedUnits: 0 } })

  // Product 8 (Concurrency Test - exactly 1 unit in one warehouse)
  await prisma.inventory.create({ data: { productId: p8.id, warehouseId: w1.id, totalUnits: 1, reservedUnits: 0 } })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
