import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const dataPromises = async (): Promise<any[]> => {
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
        passwordHash: await argon2.hash('123'),
        role: {
          connect: {
            id: 1
          }
        }
      }
    })
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
