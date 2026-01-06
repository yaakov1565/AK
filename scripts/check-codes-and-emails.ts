import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of emails that already received the CODE_CREATED email
const emailsAlreadySent = [
  'office@atereskallah.com',
  'rochelbaila@gmail.com',
  'bugs613@gmail.com',
  'hellermalky@gmail.com',
  'campaigns@atereskallah.com',
  'dinah.tiferes@gmail.com',
  'isrschwarz@gmail.com',
  'leahschwartz02@gmail.com',
  'michaelym@gmail.com',
  'reichpessy@gmail.com',
  'rifkywajchman@gmail.com',
  'miriammatzner@gmail.com',
  'perlafrand@gmail.com',
  'biancasr820@gmail.com',
  'orlyjoon26@gmail.com',
  'isakhaie@aol.com',
  'yrschneck@gmail.com',
  'landaumiri1@gmail.com',
  'a0527644613@gmail.com',
  'hindisavitsky@gmail.com',
  'schwartz3978@gmail.com',
  'mindyd81@gmail.com',
  'ppaskesz@gmail.com',
  'chanarrosenzweig@gmail.com',
  'lefkowitzestie@gmail.com',
  'dinush81@gmail.com',
  'miri@gmail.com',
  'bruchysilbiger@gmail.com',
  'saragottesman1@gmail.com',
  'batyafruchter@gmail.com',
  'dinamarilus@gmail.com',
  'malkamarilus@gmail.com',
  'miriamstroli@gmail.com',
  'chanameyer178@gmail.com',
  'saradnselig@gmail.com',
  'shiramkramer@gmail.com',
  'schapiramiri@gmail.com',
  'mindysamuels123@gmail.com',
  'rspitzer2453@gmail.com',
  'justbrocha2@aol.com',
  'raizymandelbaum@yahoo.com',
  'skasser@gmail.com',
  'tamarweinb@gmail.com',
  'saralektress@gmail.com',
  'fraidychasir01@gmail.com',
  'shevyaussenberg@gmail.com',
  'hindy@gmail.com',
  'fgreenberg1561@gmail.com',
  'chavamiriamgreenberg@gmail.com',
  'dassigreenberg1@gmail.com',
  'baila54321@gmail.com',
  'reizele22@gmail.com',
  'jakubowic@gmail.com',
  'timetosinghenny@gmail.com',
  'f0553303363@gmail.com',
  'chayellekohn@gmail.com',
  'markstern100@gmail.com',
  'chaneegold@gmail.com',
  'neshamale@hotmail.com',
  'clandau35@gmail.com',
  'hecky1987@gmail.com',
  'tillyroth@gmail.com',
  'yochevedgreenfield@gmail.com',
  'libbyr1993@gmail.com',
  'miribenedikt40@gmail.com',
  'chaniesterling@gmail.com',
  'zissisddd@gmail.com',
  'gitastern.paintnights@gmail.com',
  'leah03891@gmail.com'
].map(e => e.toLowerCase().trim())

async function main() {
  console.log('🔍 CHECKING ALL CODES AND EMAIL STATUS\n')
  console.log('=' .repeat(100))
  
  try {
    // Get all codes from database
    const allCodes = await prisma.spinCode.findMany({
      select: { 
        code: true, 
        name: true, 
        email: true,
        createdAt: true,
        usedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📊 TOTAL CODES IN DATABASE: ${allCodes.length}\n`)
    console.log('=' .repeat(100))
    
    let totalEmailsInCodes = 0
    let emailsSentCount = 0
    let emailsMissingCount = 0
    const missingEmails: Array<{ code: string; name: string; email: string }> = []
    
    // Check each code
    for (let i = 0; i < allCodes.length; i++) {
      const codeRecord = allCodes[i]
      console.log(`\n${i + 1}. CODE: ${codeRecord.code}`)
      console.log(`   Name: ${codeRecord.name || 'N/A'}`)
      console.log(`   Created: ${codeRecord.createdAt.toLocaleString()}`)
      console.log(`   Used: ${codeRecord.usedAt ? codeRecord.usedAt.toLocaleString() : 'Not used yet'}`)
      
      if (!codeRecord.email) {
        console.log(`   ⚠️  NO EMAILS ASSOCIATED WITH THIS CODE`)
        continue
      }
      
      // Parse all emails in this code (comma-separated)
      const emails = codeRecord.email
        .split(/[,;|]/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0)
      
      totalEmailsInCodes += emails.length
      
      console.log(`   Emails (${emails.length}):`)
      
      // Check status of each email
      for (const email of emails) {
        const wasSent = emailsAlreadySent.includes(email)
        if (wasSent) {
          console.log(`      ✅ ${email} - Email sent`)
          emailsSentCount++
        } else {
          console.log(`      ❌ ${email} - Email NOT sent`)
          emailsMissingCount++
          missingEmails.push({
            code: codeRecord.code,
            name: codeRecord.name || 'N/A',
            email: email
          })
        }
      }
    }
    
    // Summary
    console.log('\n' + '=' .repeat(100))
    console.log('\n📊 SUMMARY:\n')
    console.log(`Total Codes: ${allCodes.length}`)
    console.log(`Total Email Addresses across all codes: ${totalEmailsInCodes}`)
    console.log(`✅ Emails that received CODE_CREATED: ${emailsSentCount}`)
    console.log(`❌ Emails that DID NOT receive CODE_CREATED: ${emailsMissingCount}`)
    
    if (emailsMissingCount > 0) {
      console.log('\n' + '=' .repeat(100))
      console.log(`\n⚠️  MISSING EMAILS (${emailsMissingCount}):\n`)
      
      missingEmails.forEach((item, index) => {
        console.log(`${index + 1}. ${item.email}`)
        console.log(`   Code: ${item.code}`)
        console.log(`   Name: ${item.name}\n`)
      })
      
      console.log('=' .repeat(100))
      console.log('\n💡 TO SEND EMAILS TO MISSING RECIPIENTS:')
      console.log('   Run: npx tsx scripts/resend-missing-emails.ts')
    } else {
      console.log('\n✅ All emails have been sent!')
    }
    
  } catch (error) {
    console.error('✗ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
