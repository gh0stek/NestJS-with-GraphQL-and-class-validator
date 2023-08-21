import { PrismaClient } from '@prisma/client'

import { getCustomers } from './seeds/customers'

const prisma = new PrismaClient()

export async function main() {
  const customers = await getCustomers()
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    })
  }
  console.log(`Created ${customers.length} customers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
