import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const ADMIN_ROLE_ID = 1;

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
            id: ADMIN_ROLE_ID
          }
        }
      }
    }),
    await prisma.category.createMany({
      data: [
        { name: 'Electronics', iconClass: 'devices' },
        { name: 'Furniture',   iconClass: 'chair' },
        { name: 'Vehicles',    iconClass: 'directions_car' },
        { name: 'Clothing',    iconClass: 'checkroom' }
      ]
    })
  ]
}

async function doRecordsExistCheck(): Promise<void> {
  const adminRole = await prisma.role.count({
    where: {
      name: 'Admin'
    }
  })
  const regularRole = await prisma.role.count({
    where: {
      name: 'Regular'
    }
  })
  if (adminRole || regularRole) {
    throw new Error('Roles exist')
  }
  const adminUser = await prisma.user.count({
    where: {
      name: 'Admin'
    }
  })
  if (adminUser) {
    throw new Error('Admin user exists')
  }
}

async function main(): Promise<void> {

  console.log('Seeding database ...');
  
  try {
    await doRecordsExistCheck()
    await Promise.all([dataPromises()])
  } catch (error) {
    console.error(error)
    return;
  } finally {
    await prisma.$disconnect()
  }
}

main()
