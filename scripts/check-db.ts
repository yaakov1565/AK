import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking database connection and data...\n')
  
  try {
    // Check prizes
    const prizes = await prisma.prize.findMany()
    console.log(`✓ Prizes found: ${prizes.length}`)
    prizes.forEach(p => {
      console.log(`  - ${p.title}: ${p.quantityRemaining}/${p.quantityTotal} remaining`)
    })
    
    // Check codes
    const codes = await prisma.spinCode.findMany()
    console.log(`\n✓ Spin codes found: ${codes.length}`)
    
    // Check winners
    const winners = await prisma.winner.findMany()
    console.log(`✓ Winners found: ${winners.length}`)
    
    console.log('\n✓ Database connection successful!')
    
  } catch (error) {
    console.error('✗ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
