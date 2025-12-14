import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test code
  const code = await prisma.spinCode.create({
    data: {
      code: 'TEST-2025-DEMO',
      email: 'test@example.com',
    },
  })

  console.log('✅ Test code created:', code.code)
  console.log('Email:', code.email)
  console.log('\nYou can use this code to test the spinning wheel!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
