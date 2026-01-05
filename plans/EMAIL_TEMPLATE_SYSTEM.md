# Customizable Email Template System - Design Document

## 📋 Overview

Create a comprehensive email template management system that allows admins to customize all email communications sent by the Ateres Kallah Spin to Win application.

## 🎯 Requirements

### Three Email Types

1. **Code Created Email** - Sent to customer when code is generated
   - Recipient: Customer (from name/email entered during code generation)
   - Trigger: When admin generates codes
   - Purpose: Notify customer they've received a spin code worth $1,000

2. **Admin Win Notification** - Sent to admin when prize is won
   - Recipient: Admin (ADMIN_EMAIL)
   - Trigger: When user spins and wins a prize
   - Purpose: Notify admin to prepare prize fulfillment

3. **Winner Confirmation Email** - Sent to winner after spinning
   - Recipient: Customer/Winner (from code's email)
   - Trigger: When user wins a prize
   - Purpose: Confirm their win and next steps

## 🗄️ Database Schema Design

### EmailTemplate Model

```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  type        String   @unique // "CODE_CREATED", "ADMIN_WIN_NOTIFICATION", "WINNER_CONFIRMATION"
  subject     String   // Email subject line with variables
  htmlBody    String   @db.Text // HTML email body with variables
  textBody    String?  @db.Text // Plain text version (optional)
  isActive    Boolean  @default(true) // Enable/disable template
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([type, isActive])
}
```

### Template Variables System

Each email type supports specific variables that get replaced when sending:

#### CODE_CREATED Variables
```
{{customer_name}}     - Customer's name
{{customer_email}}    - Customer's email
{{spin_code}}         - The generated spin code (e.g., AK-2024-XYZ123)
{{code_value}}        - Value associated with code (e.g., "$1,000")
{{spin_url}}          - URL to spin the wheel
{{expiry_date}}       - Code expiration date (if applicable)
{{current_year}}      - Current year
{{app_name}}          - "Ateres Kallah"
```

#### ADMIN_WIN_NOTIFICATION Variables
```
{{prize_name}}        - Title of won prize
{{prize_description}} - Full description of prize
{{winner_name}}       - Name of winner
{{winner_email}}      - Email of winner
{{spin_code}}         - Code that was used
{{won_at}}            - Timestamp of win
{{admin_panel_url}}   - Link to admin panel
{{app_name}}          - "Ateres Kallah"
```

#### WINNER_CONFIRMATION Variables
```
{{winner_name}}       - Name of winner
{{prize_name}}        - Title of won prize
{{prize_description}} - Full description of prize
{{prize_image_url}}   - Image of prize (if available)
{{spin_code}}         - Code that was used
{{won_at}}            - Timestamp of win
{{contact_email}}     - Admin/contact email
{{app_name}}          - "Ateres Kallah"
```

## 🎨 Admin UI Design

### New Admin Section: Email Templates

**Route:** `/admin/email-templates`

#### Page Structure

```
┌─────────────────────────────────────────┐
│  Email Templates Management             │
│                                         │
│  Configure email templates sent by the  │
│  system. Use variables like             │
│  {{customer_name}} to personalize.      │
├─────────────────────────────────────────┤
│                                         │
│  [Tabs]                                 │
│  • Code Created Email                   │
│  • Admin Win Notification               │
│  • Winner Confirmation                  │
│                                         │
│  ┌─ Tab Content ─────────────────────┐ │
│  │                                   │ │
│  │ [x] Enable this email             │ │
│  │                                   │ │
│  │ Subject Line:                     │ │
│  │ ┌───────────────────────────────┐ │ │
│  │ │ Your Spin Code: {{spin_code}} │ │ │
│  │ └───────────────────────────────┘ │ │
│  │                                   │ │
│  │ Email Body (HTML):                │ │
│  │ ┌───────────────────────────────┐ │ │
│  │ │ <h1>Hi {{customer_name}}</h1> │ │ │
│  │ │ <p>Your code is...</p>        │ │ │
│  │ │ [Rich text editor or         │ │ │
│  │ │  textarea with preview]       │ │ │
│  │ └───────────────────────────────┘ │ │
│  │                                   │ │
│  │ Available Variables:              │ │
│  │ • {{customer_name}}               │ │
│  │ • {{spin_code}}                   │ │
│  │ • {{code_value}}                  │ │
│  │ [+ Show all variables]            │ │
│  │                                   │ │
│  │ [Preview Email] [Save Template]   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Features

1. **Tab-based Interface** - Switch between three template types
2. **Enable/Disable Toggle** - Turn templates on/off without deleting
3. **Subject Line Editor** - Simple text input with variable support
4. **HTML Body Editor** - Textarea or rich text editor
5. **Variable Reference** - Collapsible list of available variables
6. **Preview Function** - Preview email with sample data
7. **Save Button** - Save template to database
8. **Default Templates** - Pre-populated with good defaults

## 🔧 Implementation Architecture

### File Structure

```
app/
  admin/
    email-templates/
      page.tsx                    # Main admin page
  api/
    admin/
      email-templates/
        route.ts                  # GET all, PUT update
        [type]/
          route.ts                # GET by type
          preview/
            route.ts              # POST preview with sample data
components/
  EmailTemplateEditor.tsx         # Template editor component
  EmailTemplatePreview.tsx        # Preview component
lib/
  email.ts                        # Updated email service
  email-templates.ts              # Template processing logic
prisma/
  schema.prisma                   # Updated schema
  migrations/
    add_email_templates/
      migration.sql
```

### Template Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Send Request                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ Get Template by Type  │
          │ from Database         │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ Replace Variables     │
          │ with Actual Data      │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ Send via Resend API   │
          └───────────┬───────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ Log Result            │
          └───────────────────────┘
```

## 📝 Default Email Templates

### 1. Code Created Email

**Subject:** `Your Ateres Kallah Spin Code - Worth {{code_value}}!`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a1128; color: #fff; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #d4af37; }
    .content { padding: 30px 20px; }
    .code-box { background-color: rgba(212, 175, 55, 0.1); border: 2px solid #d4af37; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .code { font-size: 32px; color: #d4af37; font-weight: bold; letter-spacing: 2px; }
    .button { display: inline-block; padding: 15px 30px; background-color: #d4af37; color: #0a1128; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 {{app_name}}</h1>
      <h2>Spin to Win!</h2>
    </div>
    <div class="content">
      <h2>Hi {{customer_name}}!</h2>
      <p>Congratulations! You've received a spin code worth <strong>{{code_value}}</strong>!</p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #d4af37;">Your Spin Code:</p>
        <div class="code">{{spin_code}}</div>
      </div>
      
      <p>Use this code to spin our prize wheel and win amazing prizes!</p>
      
      <p style="text-align: center;">
        <a href="{{spin_url}}" class="button">SPIN THE WHEEL NOW</a>
      </p>
      
      <p style="font-size: 14px; color: #999; margin-top: 30px;">
        <strong>Important:</strong> This code can only be used once. Don't share it with anyone!
      </p>
    </div>
  </div>
</body>
</html>
```

### 2. Admin Win Notification

**Subject:** `🎉 Prize Won - {{prize_name}} by {{winner_name}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a1128; color: #fff; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #d4af37; }
    .content { padding: 30px 20px; }
    .info-box { background-color: rgba(212, 175, 55, 0.1); border-radius: 5px; padding: 15px; margin: 15px 0; }
    .label { color: #d4af37; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #0a1128; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 {{app_name}} - Admin Alert</h1>
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
        <p><span class="label">Code Used:</span> {{spin_code}}</p>
        <p><span class="label">Won At:</span> {{won_at}}</p>
      </div>
      
      <p>Please contact the winner to arrange prize delivery.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{admin_panel_url}}" class="button">View in Admin Panel</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### 3. Winner Confirmation Email

**Subject:** `🎊 Congratulations {{winner_name}}! You Won {{prize_name}}!`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a1128; color: #fff; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #d4af37; }
    .content { padding: 30px 20px; }
    .prize-box { background-color: rgba(212, 175, 55, 0.1); border: 2px solid #d4af37; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .prize-name { font-size: 28px; color: #d4af37; font-weight: bold; margin: 10px 0; }
    .prize-image { max-width: 100%; height: auto; border-radius: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 {{app_name}}</h1>
      <h2>You're a Winner!</h2>
    </div>
    <div class="content">
      <h2>Congratulations {{winner_name}}!</h2>
      
      <p>You've just won an amazing prize from our Spin to Win wheel!</p>
      
      <div class="prize-box">
        <p style="margin: 0; color: #d4af37;">Your Prize:</p>
        <div class="prize-name">{{prize_name}}</div>
        {{#if prize_image_url}}
        <img src="{{prize_image_url}}" alt="{{prize_name}}" class="prize-image" />
        {{/if}}
        <p style="margin-top: 15px;">{{prize_description}}</p>
      </div>
      
      <h3 style="color: #d4af37;">What happens next?</h3>
      <p>Our team will contact you within 1-2 business days to arrange delivery of your prize. Please keep an eye on your email!</p>
      
      <p style="background-color: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Questions?</strong> Contact us at <a href="mailto:{{contact_email}}" style="color: #d4af37;">{{contact_email}}</a>
      </p>
      
      <p style="text-align: center; font-size: 14px; color: #999; margin-top: 30px;">
        Code used: {{spin_code}}<br>
        Won at: {{won_at}}
      </p>
    </div>
  </div>
</body>
</html>
```

## 🔄 Integration Points

### 1. Code Generation (app/api/admin/codes/generate/route.ts)

**Current:** Creates codes but doesn't send email

**Update:** After creating codes, send CODE_CREATED email to each customer

```typescript
// After codes are created
for (const code of codes) {
  await sendTemplatedEmail('CODE_CREATED', {
    to: code.email,
    variables: {
      customer_name: code.name,
      customer_email: code.email,
      spin_code: code.code,
      code_value: '$1,000',
      spin_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      current_year: new Date().getFullYear(),
      app_name: 'Ateres Kallah'
    }
  })
}
```

### 2. Spin Result (app/api/spin/route.ts)

**Current:** Only sends admin notification

**Update:** Send both ADMIN_WIN_NOTIFICATION and WINNER_CONFIRMATION

```typescript
// After successful spin
// 1. Admin notification (already exists, update to use template)
await sendTemplatedEmail('ADMIN_WIN_NOTIFICATION', {
  to: process.env.ADMIN_EMAIL,
  variables: { ... }
})

// 2. Winner confirmation (NEW)
await sendTemplatedEmail('WINNER_CONFIRMATION', {
  to: winnerEmail,
  variables: { ... }
})
```

## 🛠️ Technical Implementation Details

### Email Template Service (lib/email-templates.ts)

```typescript
interface TemplateVariable {
  [key: string]: string | number | boolean
}

async function getTemplate(type: string): Promise<EmailTemplate | null>
async function processTemplate(template: string, variables: TemplateVariable): string
async function sendTemplatedEmail(type: string, data: { to: string, variables: TemplateVariable }): Promise<void>
```

### Variable Replacement Logic

```typescript
function processTemplate(template: string, variables: TemplateVariable): string {
  let processed = template
  
  // Replace all {{variable}} with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`
    const value = String(variables[key])
    processed = processed.replace(new RegExp(placeholder, 'g'), value)
  })
  
  // Handle conditional blocks {{#if variable}}...{{/if}}
  // Handle missing variables (remove unreplaced {{...}})
  
  return processed
}
```

## 📱 Mobile Responsiveness

All email templates include responsive CSS:
```css
@media only screen and (max-width: 600px) {
  .container { padding: 10px !important; }
  .code { font-size: 24px !important; }
  .prize-name { font-size: 20px !important; }
}
```

## 🔒 Security Considerations

1. **HTML Sanitization** - Sanitize admin input to prevent XSS
2. **Variable Validation** - Only allow defined variables
3. **Email Validation** - Verify email addresses before sending
4. **Rate Limiting** - Limit email sending to prevent abuse
5. **Template Access Control** - Only admins can edit templates

## 📊 Database Migration

```sql
-- Add EmailTemplate table
CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "htmlBody" TEXT NOT NULL,
  "textBody" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailTemplate_type_key" ON "EmailTemplate"("type");
CREATE INDEX "EmailTemplate_type_isActive_idx" ON "EmailTemplate"("type", "isActive");

-- Insert default templates
INSERT INTO "EmailTemplate" (id, type, subject, htmlBody, isActive)
VALUES 
  (gen_random_uuid(), 'CODE_CREATED', 'Your Ateres Kallah Spin Code - Worth {{code_value}}!', '...', true),
  (gen_random_uuid(), 'ADMIN_WIN_NOTIFICATION', '🎉 Prize Won - {{prize_name}} by {{winner_name}}', '...', true),
  (gen_random_uuid(), 'WINNER_CONFIRMATION', '🎊 Congratulations {{winner_name}}! You Won {{prize_name}}!', '...', true);
```

## ✅ Testing Plan

1. **Template Creation** - Verify all three templates are created with defaults
2. **Template Editing** - Update template and verify changes persist
3. **Variable Replacement** - Test all variables are correctly replaced
4. **Code Created Email** - Generate code and verify customer receives email
5. **Win Notification** - Spin wheel and verify both admin and winner receive emails
6. **Preview Function** - Test email preview with sample data
7. **Enable/Disable** - Toggle templates and verify emails are/aren't sent

## 📈 Future Enhancements

1. **Rich Text Editor** - WYSIWYG editor for easier template creation
2. **Email Scheduling** - Schedule emails for later delivery
3. **A/B Testing** - Test different templates for better engagement
4. **Email Analytics** - Track open rates, click rates
5. **Attachments** - Allow attaching files to emails
6. **Multi-language** - Templates in multiple languages
7. **Email History** - Log all sent emails

## 🎯 Success Criteria

- ✅ Admin can customize all three email types
- ✅ Templates support dynamic variables
- ✅ Emails are sent automatically at the right time
- ✅ Preview function works correctly
- ✅ Mobile-responsive email templates
- ✅ Easy to use admin interface
- ✅ No code changes needed to update email content

---

**Status:** Ready for Implementation
**Estimated Implementation Time:** 2-3 development sessions
