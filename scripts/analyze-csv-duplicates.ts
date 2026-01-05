import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CSV data from user
const csvEntries = [
  { name: "Rebbetzin Morgenstern", emails: ["office@atereskallah.com"], amount: 11254 },
  { name: "Rochel Baila Genzler", emails: ["rochelbaila@gmail.com"], amount: 4726 },
  { name: "Rochelle Schneck", emails: ["yrschneck@gmail.com"], amount: 3186 },
  { name: "Miri Landau", emails: ["landaumiri1@gmail.com"], amount: 3178 },
  { name: "Shaina Ashkenazy", emails: ["a0527644613@gmail.com"], amount: 3000 },
  { name: "Hindy Savitsky", emails: ["hindisavitsky@gmail.com"], amount: 2862 },
  { name: "Malky Oberlander", emails: ["schwartz3978@gmail.com"], amount: 2296 },
  { name: "Mindy David, Batya Salamon & Malky Heller", emails: ["mindyd81@gmail.com", "bugs613@gmail.com", "hellermalky@gmail.com"], amount: 2115 },
  { name: "Gober and Mandlebaum", emails: ["ppaskesz@gmail.com"], amount: 2000 },
  { name: "Chana Rochel Rosenzweig", emails: ["chanarrosenzweig@gmail.com"], amount: 1974 },
  { name: "Esther Lefkowitz & Dina Levy", emails: ["lefkowitzestie@gmail.com", "dinush81@gmail.com"], amount: 1901 },
  { name: "Bruchy Knopfler", emails: ["bruchysilbiger@gmail.com"], amount: 1715 },
  { name: "Sara Gottesman", emails: ["saragottesman1@gmail.com"], amount: 1607 },
  { name: "Batty Srulowitz", emails: ["batyafruchter@gmail.com"], amount: 1555 },
  { name: "Chavi Tusk", emails: ["campaigns@atereskallah.com"], amount: 1501 },
  { name: "Dinah Tiferes Braude", emails: ["dinah.tiferes@gmail.com"], amount: 1496 },
  { name: "Miriam, Ruchy & Malka Marilus", emails: ["dinamarilus@gmail.com", "malkamarilus@gmail.com", "miriamstroli@gmail.com"], amount: 1487 },
  { name: "Chana Meyer, Sara Fialkoff & Shira Kramer", emails: ["chanameyer178@gmail.com", "saradnselig@gmail.com", "shiramkramer@gmail.com"], amount: 1438 },
  { name: "Miri Schapira", emails: ["schapiramiri@gmail.com"], amount: 1378 },
  { name: "Sara Rochel Schwartz, Leah Samuels, Mindy Samuels, Rikki Schwartz & Brocha Freiedman", emails: ["isrschwarz@gmail.com", "leahschwartz02@gmail.com", "mindysamuels123@gmail.com", "rspitzer2453@gmail.com", "justbrocha2@aol.com"], amount: 1287 },
  { name: "R Mandelbaum", emails: ["raizymandelbaum@yahoo.com"], amount: 1220 },
  { name: "Tamar Kahn, Shira Kasser & Lenea Markowitz", emails: ["skasser@gmail.com", "tamarweinb@gmail.com", "michaelym@gmail.com"], amount: 1173 },
  { name: "The Choir", emails: ["Reichpessy@gmail.com"], amount: 1152 },
  { name: "Sarale Tress, Fraidy Fogel", emails: ["saralektress@gmail.com", "fraidychasir01@gmail.com"], amount: 1106 },
  { name: "Shevy Aussenberg", emails: ["shevyaussenberg@gmail.com"], amount: 1100 },
  { name: "Frances Greenberg", emails: ["fgreenberg1561@gmail.com"], amount: 1087 },
  { name: "Chava Miriam Greenberg, Dassy Blau, Baila Dzialoszynski & Rifky Wajchman", emails: ["chavamiriamgreenberg@gmail.com", "dassigreenberg1@gmail.com", "baila54321@gmail.com", "rifkywajchman@gmail.com"], amount: 1072 },
  { name: "Miriam Stauber, Reizele Kaufman", emails: ["miriammatzner@gmail.com", "reizele22@gmail.com"], amount: 1039 },
  { name: "Rifky Jakubowic", emails: ["jakubowic@gmail.com"], amount: 1035 },
  { name: "Hennie Langner", emails: ["timetosinghenny@gmail.com"], amount: 1032 },
  { name: "Faigy Bleier, Esty Sternlicht & Chayale Kohn", emails: ["f0553303363@gmail.com", "chayellekohn@gmail.com", "markstern100@gmail.com"], amount: 1030 },
  { name: "Chanee Silber & Perla Jachimowitz", emails: ["chaneegold@gmail.com", "perlafrand@gmail.com"], amount: 1028 },
  { name: "Bianca Rosenthal, Yocheved Greenfield & Esther Shamel", emails: ["biancasr820@gmail.com", "yochevedgreenfield@gmail.com"], amount: 1010 },
  { name: "Dina Neuman", emails: ["Neshamale@hotmail.com"], amount: 1010 },
  { name: "Chavi Landau", emails: ["clandau35@gmail.com"], amount: 1000 },
  { name: "Devorah Baalhaness & Orly Alyeshmereini", emails: ["hecky1987@gmail.com", "orlyjoon26@gmail.com"], amount: 1000 },
  { name: "Izzy Sakhaie", emails: ["Isakhaie@aol.com"], amount: 1000 },
  { name: "Roth Family", emails: ["tillyroth@gmail.com"], amount: 1000 },
  { name: "Tzippy", emails: ["intratertzippy@gmail.com"], amount: 789 }
]

async function main() {
  console.log('🔍 Analyzing CSV Upload Issues\n')
  console.log('=' .repeat(80))
  
  try {
    // Get all existing codes
    const allCodes = await prisma.spinCode.findMany({
      select: { code: true, name: true, email: true, isUsed: true }
    })
    
    console.log(`📊 Total codes in database: ${allCodes.length}\n`)
    
    let wouldBeSkippedLowAmount = 0
    let wouldBeSkippedDuplicate = 0
    let wouldBeCreated = 0
    
    console.log('📋 Analysis of CSV Entries:\n')
    
    for (let i = 0; i < csvEntries.length; i++) {
      const entry = csvEntries[i]
      const entryNum = i + 1
      
      // Check if amount is too low
      if (entry.amount < 1000) {
        console.log(`${entryNum}. ❌ SKIP (LOW AMOUNT): ${entry.name}`)
        console.log(`   Amount: $${entry.amount} (minimum $1,000 required)`)
        console.log(`   Emails: ${entry.emails.join(', ')}\n`)
        wouldBeSkippedLowAmount++
        continue
      }
      
      // Check for duplicates
      const emailsLower = entry.emails.map(e => e.toLowerCase().trim())
      let hasDuplicate = false
      let duplicateEmail = ''
      let existingCode = null
      
      for (const email of emailsLower) {
        for (const code of allCodes) {
          if (code.email && code.email.toLowerCase().includes(email)) {
            hasDuplicate = true
            duplicateEmail = email
            existingCode = code
            break
          }
        }
        if (hasDuplicate) break
      }
      
      if (hasDuplicate) {
        console.log(`${entryNum}. ❌ SKIP (DUPLICATE): ${entry.name}`)
        console.log(`   Duplicate email: ${duplicateEmail}`)
        console.log(`   Existing code: ${existingCode?.code}`)
        console.log(`   Existing name: ${existingCode?.name}`)
        console.log(`   Code used: ${existingCode?.isUsed ? 'YES' : 'NO'}`)
        console.log(`   All emails in entry: ${entry.emails.join(', ')}\n`)
        wouldBeSkippedDuplicate++
      } else {
        console.log(`${entryNum}. ✅ WOULD CREATE: ${entry.name}`)
        console.log(`   Amount: $${entry.amount}`)
        console.log(`   Emails: ${entry.emails.join(', ')}\n`)
        wouldBeCreated++
      }
    }
    
    console.log('=' .repeat(80))
    console.log('\n📊 SUMMARY:\n')
    console.log(`Total CSV entries: ${csvEntries.length}`)
    console.log(`Would be created: ${wouldBeCreated}`)
    console.log(`Skipped (amount < $1,000): ${wouldBeSkippedLowAmount}`)
    console.log(`Skipped (duplicate email): ${wouldBeSkippedDuplicate}`)
    console.log(`\n⚠️  You mentioned 17 received emails. If that matches "Would be created" above,`)
    console.log(`    then the duplicates are the cause. Otherwise, check for email sending failures.`)
    
  } catch (error) {
    console.error('✗ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
