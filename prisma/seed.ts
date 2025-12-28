import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing (optional, for safety in dev)
  // await prisma.product.deleteMany();
  // await prisma.dataPlan.deleteMany();

  // 1. Seed Product
  const product = await prisma.product.create({
    data: {
      name: "MTN 5G Router",
      description: "High-speed 5G router, unlocked for all networks. Includes 50GB bonus data.",
      price: 45000,
      image: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=400",
      inStock: true,
    }
  });

  // 2. Seed Data Plan (MTN 1GB)
  // Amigo ID for MTN 1GB is 1001 (based on docs provided in prompt)
  const plan = await prisma.dataPlan.create({
    data: {
      network: "MTN",
      data: "1GB",
      validity: "30 Days",
      price: 450, // Selling price
      planId: 1001, // Amigo Catalog ID
    }
  });

  console.log({ product, plan });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    (process as any).exit(1);
  });