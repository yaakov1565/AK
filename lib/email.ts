/**
 * Email notification service
 * Sends notifications to admin when prizes are won
 */

import nodemailer from 'nodemailer'

interface WinNotification {
  code: string
  prizeTitle: string
  timestamp: Date
}

/**
 * Send email notification to admin about a prize win
 */
export async function sendWinNotification(data: WinNotification) {
  // Skip in development if no email config
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('Email not configured, skipping notification:', data)
    return
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
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
                  <p><span class="label">Time:</span> ${data.timestamp.toLocaleString()}</p>
                </div>
                <p>Please contact the winner to arrange prize delivery.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    console.log('Win notification email sent successfully')
  } catch (error) {
    console.error('Failed to send win notification email:', error)
    // Don't throw - we don't want email failure to break the spin
  }
}
