/**
 * Email notification service
 * Sends notifications to admin when prizes are won
 * Uses Resend for reliable email delivery
 */

import { Resend } from 'resend'

interface WinNotification {
  code: string
  prizeTitle: string
  timestamp: Date
  winner?: {
    name?: string
    email?: string
  }
}

/**
 * Send email notification to admin about a prize win
 */
export async function sendWinNotification(data: WinNotification) {
  // Skip if no Resend API key configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping notification:', data)
    return
  }

  if (!process.env.ADMIN_EMAIL) {
    console.log('Admin email not configured, skipping notification')
    return
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email using Resend
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Ateres Kallah <noreply@yourdomain.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Prize Won - ${data.prizeTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #0a1128;
                color: #fff;
              }
              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 2px solid #d4af37;
              }
              .content {
                padding: 30px 20px;
              }
              .prize {
                font-size: 24px;
                color: #d4af37;
                font-weight: bold;
              }
              .info {
                margin: 15px 0;
                padding: 10px;
                background-color: rgba(212, 175, 55, 0.1);
                border-radius: 5px;
              }
              .label {
                color: #d4af37;
                font-weight: bold;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #d4af37;
                font-size: 12px;
                color: #888;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Ateres Kallah - Spin to Win</h1>
              </div>
              <div class="content">
                <h2>New Prize Won!</h2>
                <div class="info">
                  <p><span class="label">Prize:</span> <span class="prize">${data.prizeTitle}</span></p>
                  <p><span class="label">Code Used:</span> ${data.code}</p>
                  ${data.winner?.name ? `<p><span class="label">Winner Name:</span> ${data.winner.name}</p>` : ''}
                  ${data.winner?.email ? `<p><span class="label">Winner Email:</span> ${data.winner.email}</p>` : ''}
                  <p><span class="label">Time:</span> ${data.timestamp.toLocaleString()}</p>
                </div>
                <p>Please contact the winner to arrange prize delivery.</p>
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://spin2win-ak.org'}/admin/winners"
                     style="display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #0a1128; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View in Admin Panel
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated notification from Ateres Kallah Spin to Win</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log('Win notification email sent successfully via Resend:', result)
  } catch (error) {
    console.error('Failed to send win notification email:', error)
    // Don't throw - we don't want email failure to break the spin
  }
}
