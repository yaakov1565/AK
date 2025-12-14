import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.winner.deleteMany({})
  await prisma.spinCode.deleteMany({})
  await prisma.prize.deleteMany({})

  // Create sample prizes
  const prizes = [
    {
      title: 'Free Coffee',
      quantityTotal: 10,
      quantityRemaining: 10,
      weight: 30, // Higher weight = more likely to win
    },
    {
      title: 'Gift Card $10',
      quantityTotal: 8,
      quantityRemaining: 8,
      weight: 25,
    },
    {
      title: 'Gift Card $25',
      quantityTotal: 5,
      quantityRemaining: 5,
      weight: 15,
    },
    {
      title: 'Gift Card $50',
      quantityTotal: 3,
      quantityRemaining: 3,
      weight: 10,
    },
    {
      title: 'Free Dessert',
      quantityTotal: 15,
      quantityRemaining: 15,
      weight: 35,
    },
    {
      title: 'VIP Event Pass',
      quantityTotal: 2,
      quantityRemaining: 2,
      weight: 5,
    },
    {
      title: 'Gift Card $100',
      quantityTotal: 1,
      quantityRemaining: 1,
      weight: 3,
    },
    {
      title: 'Free Month Membership',
      quantityTotal: 4,
      quantityRemaining: 4,
      weight: 12,
    },
  ]

  for (const prize of prizes) {
    await prisma.prize.create({
      data: prize,
    })
  }

  console.log('✅ Database seeded with sample prizes!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
