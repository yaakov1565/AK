/**
 * Seed script for email templates
 * Run with: npx tsx prisma/seed-email-templates.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const emailTemplates = [
  {
    type: 'CODE_CREATED',
    subject: 'Your Exclusive Ateres Kallah Spin to Win Code',
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Satisfy&display=swap" rel="stylesheet">
  <style>
    body { 
      font-family: 'Playfair Display', Georgia, serif; 
      line-height: 1.8; 
      color: #ffffff; 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #1a2847, #2d3561, #3d2855, #5a2d5f, #6b2d5c, #5a2d5f, #3d2855, #2d3561, #1a2847);
      background-size: 400% 400%;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 0; 
      background: rgba(10, 17, 40, 0.85);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .header { 
      text-align: center; 
      padding: 40px 20px 30px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      border-bottom: 3px solid #d4af37; 
    }
    .header h1 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #d4af37;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15);
    }
    .header-subtitle {
      margin: 15px 0 0 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #d4af37;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212, 175, 55, 0.12);
    }
    .fancy-number {
      font-family: 'Satisfy', cursive;
      font-size: 1.4em;
      color: #fbbf24;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15);
    }
    .content { 
      padding: 40px 35px; 
      background: rgba(26, 40, 71, 0.4);
      color: #e5e7eb;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #d1d5db;
    }
    .content h2 {
      color: #d4af37;
      font-size: 24px;
    }
    .code-box { 
      background: rgba(212, 175, 55, 0.08);
      border: 3px solid #d4af37; 
      border-radius: 10px; 
      padding: 30px; 
      margin: 30px 0; 
      text-align: center;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
    }
    .code-label { 
      font-size: 18px; 
      color: #d4af37; 
      font-weight: 700;
      margin-bottom: 12px;
      font-family: 'Playfair Display', Georgia, serif;
      letter-spacing: 0.05em;
    }
    .code { 
      font-size: 32px; 
      color: #d4af37; 
      font-weight: 700; 
      letter-spacing: 4px; 
      margin: 15px 0;
      font-family: 'Playfair Display', Georgia, serif;
      text-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
    }
    .button { 
      display: inline-block; 
      padding: 16px 45px; 
      background-color: #d4af37; 
      color: #0a1128; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 700; 
      margin: 25px 0; 
      font-size: 17px;
      font-family: 'Playfair Display', Georgia, serif;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
    }
    .footer { 
      text-align: center; 
      padding: 25px 20px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      color: #9ca3af; 
      font-size: 13px;
      border-top: 2px solid #d4af37;
    }
    .website-link { 
      color: #d4af37; 
      text-decoration: none; 
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .container { padding: 0 !important; }
      .header h1 { font-size: 32px !important; }
      .header-subtitle { font-size: 22px !important; }
      .content { padding: 25px 20px !important; }
      .code { font-size: 24px !important; letter-spacing: 2px !important; }
      .button { padding: 14px 35px !important; font-size: 16px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ATERES KALLAH</h1>
      <p class="header-subtitle">Spin <span class="fancy-number">2</span> Win</p>
    </div>
    <div class="content">
      <p>Congratulations on reaching <strong style="color: #d4af37;">{{code_value}}</strong> in your fundraising campaign!</p>
      
      <p>Here is your exclusive prize code for the Ateres Kallah Spin to Win:</p>
      
      <div class="code-box">
        <div class="code-label">Code:</div>
        <div class="code">{{spin_code}}</div>
      </div>
      
      <p>Please visit our prize wheel page to use your code and claim your prize:</p>
      
      <p style="text-align: center;">
        <a href="{{spin_url}}" class="button">CLAIM YOUR PRIZE</a>
      </p>
      
      <p style="margin-top: 30px;">Thank you for your incredible support!</p>
      
      <p style="margin-top: 25px; color: #d1d5db;">
        Best regards,<br>
        <strong style="color: #d4af37; font-size: 17px;">Ateres Kallah Team</strong>
      </p>
      
      <hr style="border: none; border-top: 1px solid rgba(212, 175, 55, 0.3); margin: 30px 0;">
      
      <p style="font-size: 14px; color: #9ca3af;">
        <strong>Website:</strong> <a href="{{spin_url}}" class="website-link">{{spin_url}}</a><br>
        <strong>Note:</strong> This code can only be used once. Please keep it confidential.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0; color: #9ca3af;">© {{current_year}} Ateres Kallah. All rights reserved.</p>
      <p style="margin: 12px 0 0 0;">Questions? Contact us at <a href="mailto:admin@spin2win-ak.org" class="website-link">admin@spin2win-ak.org</a></p>
    </div>
  </div>
</body>
</html>`,
    isActive: true
  },
  {
    type: 'ADMIN_WIN_NOTIFICATION',
    subject: '🎉 Prize Won - {{prize_name}} by {{winner_name}}',
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Satisfy&display=swap" rel="stylesheet">
  <style>
    body { 
      font-family: 'Playfair Display', Georgia, serif; 
      line-height: 1.8; 
      color: #ffffff; 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #1a2847, #2d3561, #3d2855, #5a2d5f, #6b2d5c, #5a2d5f, #3d2855, #2d3561, #1a2847);
      background-size: 400% 400%;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 0; 
      background: rgba(10, 17, 40, 0.85);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .header { 
      text-align: center; 
      padding: 40px 20px 30px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      border-bottom: 3px solid #d4af37; 
    }
    .header h1 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #d4af37;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15);
    }
    .content { 
      padding: 40px 35px; 
      background: rgba(26, 40, 71, 0.4);
      color: #e5e7eb;
    }
    .content h2 {
      color: #d4af37;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #d1d5db;
    }
    .info-box { 
      background: rgba(212, 175, 55, 0.08);
      border: 2px solid #d4af37; 
      border-radius: 10px; 
      padding: 20px; 
      margin: 20px 0;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
    }
    .info-box p {
      margin: 10px 0;
    }
    .label { 
      color: #d4af37; 
      font-weight: 700;
      font-size: 15px;
    }
    .button { 
      display: inline-block; 
      padding: 16px 40px; 
      background-color: #d4af37; 
      color: #0a1128; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 700;
      font-size: 16px;
      font-family: 'Playfair Display', Georgia, serif;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
    }
    .footer { 
      text-align: center; 
      padding: 25px 20px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      color: #9ca3af; 
      font-size: 13px;
      border-top: 2px solid #d4af37;
    }
    @media only screen and (max-width: 600px) {
      .container { padding: 0 !important; }
      .header h1 { font-size: 26px !important; }
      .content { padding: 25px 20px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ATERES KALLAH - Admin Alert</h1>
    </div>
    <div class="content">
      <h2>New Prize Won!</h2>
      
      <div class="info-box">
        <p><span class="label">Prize:</span> <span style="font-size: 20px; color: #d4af37;">{{prize_name}}</span></p>
        <p><span class="label">Description:</span> {{prize_description}}</p>
      </div>
      
      <div class="info-box">
        <p><span class="label">Winner Name:</span> {{winner_name}}</p>
        <p><span class="label">Winner Email:</span> {{winner_email}}</p>
        <p><span class="label">Code Used:</span> <span style="font-family: monospace; color: #fbbf24;">{{spin_code}}</span></p>
        <p><span class="label">Won At:</span> {{won_at}}</p>
      </div>
      
      <p>Please contact the winner to arrange prize delivery.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{admin_panel_url}}" class="button">View in Admin Panel</a>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">This is an automated notification from Ateres Kallah Spin to Win</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true
  },
  {
    type: 'WINNER_CONFIRMATION',
    subject: '🎊 Congratulations {{winner_name}}! You Won {{prize_name}}!',
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Satisfy&display=swap" rel="stylesheet">
  <style>
    body { 
      font-family: 'Playfair Display', Georgia, serif; 
      line-height: 1.8; 
      color: #ffffff; 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #1a2847, #2d3561, #3d2855, #5a2d5f, #6b2d5c, #5a2d5f, #3d2855, #2d3561, #1a2847);
      background-size: 400% 400%;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 0; 
      background: rgba(10, 17, 40, 0.85);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    .header { 
      text-align: center; 
      padding: 40px 20px 30px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      border-bottom: 3px solid #d4af37; 
    }
    .header h1 {
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #d4af37;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15);
    }
    .header-subtitle {
      margin: 15px 0 0 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #d4af37;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212, 175, 55, 0.12);
    }
    .fancy-number {
      font-family: 'Satisfy', cursive;
      font-size: 1.4em;
      color: #fbbf24;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15);
    }
    .content { 
      padding: 40px 35px; 
      background: rgba(26, 40, 71, 0.4);
      color: #e5e7eb;
    }
    .content h2 {
      color: #d4af37;
      font-size: 26px;
      margin-top: 0;
    }
    .content h3 {
      color: #d4af37;
      font-size: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #d1d5db;
    }
    .prize-box { 
      background: rgba(212, 175, 55, 0.08);
      border: 3px solid #d4af37; 
      border-radius: 10px; 
      padding: 25px; 
      margin: 25px 0; 
      text-align: center;
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
    }
    .prize-name { 
      font-size: 30px; 
      color: #d4af37; 
      font-weight: 700; 
      margin: 15px 0;
      font-family: 'Playfair Display', Georgia, serif;
      text-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
    }
    .footer { 
      text-align: center; 
      padding: 25px 20px; 
      background: linear-gradient(135deg, rgba(26, 40, 71, 0.95), rgba(45, 53, 97, 0.95));
      color: #9ca3af; 
      font-size: 13px;
      border-top: 2px solid #d4af37;
    }
    .website-link { 
      color: #d4af37; 
      text-decoration: none; 
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .container { padding: 0 !important; }
      .header h1 { font-size: 32px !important; }
      .header-subtitle { font-size: 22px !important; }
      .content { padding: 25px 20px !important; }
      .prize-name { font-size: 22px !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ATERES KALLAH</h1>
      <p class="header-subtitle">Spin <span class="fancy-number">2</span> Win</p>
    </div>
    <div class="content">
      <h2>🎊 Congratulations {{winner_name}}!</h2>
      
      <p>You've just won an amazing prize from our Spin to Win wheel!</p>
      
      <div class="prize-box">
        <p style="margin: 0; color: #d4af37; font-size: 15px; font-weight: 700;">Your Prize:</p>
        <div class="prize-name">{{prize_name}}</div>
        <p style="margin-top: 15px; color: #d1d5db;">{{prize_description}}</p>
      </div>
      
      <h3>What happens next?</h3>
      <p>Our team will contact you within 1-2 business days to arrange delivery of your prize. Please keep an eye on your email!</p>
      
      <p style="background: rgba(212, 175, 55, 0.08); border: 2px solid #d4af37; padding: 18px; border-radius: 8px; margin: 25px 0;">
        <strong style="color: #d4af37;">Questions?</strong> Contact us at <a href="mailto:{{contact_email}}" class="website-link">{{contact_email}}</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid rgba(212, 175, 55, 0.3); margin: 30px 0;">
      
      <p style="font-size: 14px; color: #9ca3af;">
        Code used: <span style="font-family: monospace; color: #fbbf24;">{{spin_code}}</span><br>
        Won at: {{won_at}}
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0; color: #9ca3af;">© {{current_year}} Ateres Kallah. All rights reserved.</p>
      <p style="margin: 12px 0 0 0;">Questions? Contact us at <a href="mailto:admin@spin2win-ak.org" class="website-link">admin@spin2win-ak.org</a></p>
    </div>
  </div>
</body>
</html>`,
    isActive: true
  }
]

async function main() {
  console.log('🌱 Seeding email templates...')

  for (const template of emailTemplates) {
    const result = await prisma.emailTemplate.upsert({
      where: { type: template.type },
      update: {
        subject: template.subject,
        htmlBody: template.htmlBody,
        isActive: template.isActive
      },
      create: template
    })
    console.log(`✅ Created/Updated template: ${result.type}`)
  }

  console.log('✨ Email templates seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding email templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
