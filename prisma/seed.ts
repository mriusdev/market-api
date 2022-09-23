import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  await prisma.role.createMany({
    data: [
      { name: 'Admin' },
      { name: 'Regular' }
    ]
  })
  .catch(error => console.error(error))
  .finally(async (): Promise<void> => await prisma.$disconnect())
}

main()
