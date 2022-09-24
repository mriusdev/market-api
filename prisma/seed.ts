import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dataPromises = async (): Promise<any> => {
  return [
    await prisma.role.createMany({
      data: [
        { name: 'Admin' },
        { name: 'Regular' }
      ]
    }),
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@user.com',
        username: 'root',
        passwordHash: '123',
        role: {
          connect: {
            id: 1
          }
        }
      }
    }),
  ]
}

async function main(): Promise<void> {
  console.log('Seeding database ...');
  
  try {
    await Promise.all([dataPromises()])
  } catch (error) {
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
