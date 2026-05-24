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
    data: { name: 'New York Central', location: 'NY, USA' }
  })
  const w2 = await prisma.warehouse.create({
    data: { name: 'California West', location: 'CA, USA' }
  })
  const w3 = await prisma.warehouse.create({
    data: { name: 'Texas Hub', location: 'TX, USA' }
  })

  // Create Products
  const p1 = await prisma.product.create({
    data: {
      name: 'Wireless Noise-Canceling Headphones',
      sku: 'AUDIO-WH-1000',
      description: 'Premium wireless headphones with industry-leading noise cancellation.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      price: 299.99,
    }
  })
  const p2 = await prisma.product.create({
    data: {
      name: 'Mechanical Keyboard Pro',
      sku: 'KEY-MECH-PRO',
      description: 'Tactile mechanical keyboard with RGB backlighting and hot-swappable switches.',
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
      price: 149.50,
    }
  })
  const p3 = await prisma.product.create({
    data: {
      name: 'Ergonomic Office Chair',
      sku: 'FURN-ERGO-CHAIR',
      description: 'Adjustable ergonomic chair designed for long hours of comfortable work.',
      imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
      price: 399.00,
    }
  })
  const p4 = await prisma.product.create({
    data: {
      name: '4K Ultra HD Monitor',
      sku: 'MON-4K-27',
      description: '27-inch 4K monitor with ultra-thin bezels and color accuracy.',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      price: 450.00,
    }
  })
  const p5 = await prisma.product.create({
    data: {
      name: 'Limited Edition Sneakers (Concurrency Test)',
      sku: 'SNEAK-LTD-TEST',
      description: 'Highly sought after sneakers. Only 1 left in stock across all warehouses to test concurrency!',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      price: 199.99,
    }
  })

  // Create Inventory
  // Product 1
  await prisma.inventory.create({ data: { productId: p1.id, warehouseId: w1.id, totalUnits: 50, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p1.id, warehouseId: w2.id, totalUnits: 30, reservedUnits: 0 } })
  
  // Product 2
  await prisma.inventory.create({ data: { productId: p2.id, warehouseId: w1.id, totalUnits: 15, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p2.id, warehouseId: w3.id, totalUnits: 25, reservedUnits: 0 } })
  
  // Product 3
  await prisma.inventory.create({ data: { productId: p3.id, warehouseId: w2.id, totalUnits: 5, reservedUnits: 0 } })
  
  // Product 4
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w1.id, totalUnits: 10, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w2.id, totalUnits: 10, reservedUnits: 0 } })
  await prisma.inventory.create({ data: { productId: p4.id, warehouseId: w3.id, totalUnits: 10, reservedUnits: 0 } })

  // Product 5 (Concurrency Test - exactly 1 unit in one warehouse)
  await prisma.inventory.create({ data: { productId: p5.id, warehouseId: w1.id, totalUnits: 1, reservedUnits: 0 } })

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
