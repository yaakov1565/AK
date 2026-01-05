import { PrismaClient } from '@prisma/client'
import { sendTemplatedEmail } from '../lib/email-templates'

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
  'isakhaie@aol.com'
].map(e => e.toLowerCase().trim())

async function main() {
  console.log('🔍 Finding Missing Email Recipients\n')
  console.log('=' .repeat(80))
  
  try {
    // Get all codes from database
    const allCodes = await prisma.spinCode.findMany({
      select: { 
        code: true, 
        name: true, 
        email: true 
      }
    })
    
    console.log(`📊 Total codes in database: ${allCodes.length}\n`)
    
    const emailsToResend: Array<{
      email: string
      name: string
      code: string
    }> = []
    
    // Check each code to see which emails need to be sent
    for (const codeRecord of allCodes) {
      if (!codeRecord.email) {
        console.log(`⚠️ Code ${codeRecord.code} has no email addresses`)
        continue
      }
      
      // Parse all emails in this code (comma-separated)
      const emails = codeRecord.email
        .split(/[,;|]/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0)
      
      // Check if any email in this code did NOT receive the email
      for (const email of emails) {
        if (!emailsAlreadySent.includes(email)) {
          emailsToResend.push({
            email: email,
            name: codeRecord.name || 'Valued Customer',
            code: codeRecord.code
          })
        }
      }
    }
    
    console.log(`📧 Emails that need to be sent: ${emailsToResend.length}\n`)
    
    if (emailsToResend.length === 0) {
      console.log('✅ All emails have already been sent!')
      return
    }
    
    // Display the emails that will be sent
    console.log('📋 Will send emails to:\n')
    emailsToResend.forEach((item, index) => {
      console.log(`${index + 1}. ${item.email}`)
      console.log(`   Name: ${item.name}`)
      console.log(`   Code: ${item.code}\n`)
    })
    
    console.log('=' .repeat(80))
    console.log('\n🚀 Starting to send emails...\n')
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spin2win-ak.org'
    let sent = 0
    let failed = 0
    
    for (const item of emailsToResend) {
      try {
        const result = await sendTemplatedEmail('CODE_CREATED', {
          to: item.email,
          variables: {
            customer_name: item.name,
            customer_email: item.email,
            spin_code: item.code,
            code_value: '$1,000+',
            spin_url: appUrl,
            expiry_date: 'No expiration',
            current_year: new Date().getFullYear(),
            app_name: 'Ateres Kallah'
          }
        })
        
        if (result) {
          console.log(`✅ Sent to ${item.email}`)
          sent++
        } else {
          console.error(`❌ Failed to send to ${item.email} - Check template/Resend config`)
          failed++
        }
        
        // Add delay between emails to avoid rate limiting (200ms)
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`❌ Error sending to ${item.email}:`, error)
        failed++
      }
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('\n📊 FINAL SUMMARY:\n')
    console.log(`Total emails to send: ${emailsToResend.length}`)
    console.log(`✅ Successfully sent: ${sent}`)
    console.log(`❌ Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\n⚠️  Some emails failed. Check:')
      console.log('   1. CODE_CREATED template is active in database')
      console.log('   2. RESEND_API_KEY is set in .env')
      console.log('   3. EMAIL_FROM is configured with verified domain')
      console.log('   4. Not hitting Resend rate limits/quota')
    }
    
  } catch (error) {
    console.error('✗ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
