import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const medicalImages = [
  "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=800", // Stethoscope
  "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&q=80&w=800", // Medical device
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800", // Surgery
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800", // Lab
  "https://images.unsplash.com/photo-1586942425654-228f09f872f9?auto=format&fit=crop&q=80&w=800", // PPE
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", // Microscope
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800", // Hospital
  "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800", // First Aid
];

async function updateImages() {
  const products = await prisma.product.findMany();
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    // Assign a rotating image from the medicalImages array
    const newImage = medicalImages[i % medicalImages.length];
    
    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: newImage }
    });
  }
  console.log("Successfully updated all products with hyper-realistic Unsplash medical photos!");
}

updateImages().catch(console.error).finally(() => prisma.$disconnect());
