# Email Template System - Implementation Roadmap

## 📋 Overview

This roadmap breaks down the implementation of the customizable email template system into clear, actionable steps. Follow these in order for a smooth implementation.

---

## 🎯 Phase 1: Database & Core Infrastructure

### Step 1.1: Update Prisma Schema
**File:** `prisma/schema.prisma`

Add the EmailTemplate model:
```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  type        String   @unique // "CODE_CREATED", "ADMIN_WIN_NOTIFICATION", "WINNER_CONFIRMATION"
  subject     String
  htmlBody    String   @db.Text
  textBody    String?  @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([type, isActive])
}
```

**Commands to run:**
```bash
npx prisma migrate dev --name add_email_templates
npx prisma generate
```

### Step 1.2: Create Seed Data
**File:** `prisma/seed-email-templates.ts`

Create a script to populate default templates:
- CODE_CREATED template
- ADMIN_WIN_NOTIFICATION template
- WINNER_CONFIRMATION template

**Command to run:**
```bash
npx tsx prisma/seed-email-templates.ts
```

### Step 1.3: Create Email Template Service
**File:** `lib/email-templates.ts`

Functions needed:
- `getTemplate(type: string): Promise<EmailTemplate | null>`
- `processTemplate(template: string, variables: object): string`
- `sendTemplatedEmail(type: string, data: object): Promise<void>`

**Dependencies:**
- Use existing Resend integration
- Variable replacement logic
- Error handling

---

## 🎯 Phase 2: API Routes

### Step 2.1: Email Templates API - List & Update
**File:** `app/api/admin/email-templates/route.ts`

**GET:** Return all email templates
```typescript
GET /api/admin/email-templates
Response: { templates: EmailTemplate[] }
```

**PUT:** Update a template
```typescript
PUT /api/admin/email-templates
Body: { type, subject, htmlBody, isActive }
Response: { success: true, template: EmailTemplate }
```

### Step 2.2: Email Templates API - Get by Type
**File:** `app/api/admin/email-templates/[type]/route.ts`

**GET:** Return specific template
```typescript
GET /api/admin/email-templates/CODE_CREATED
Response: { template: EmailTemplate }
```

### Step 2.3: Email Preview API
**File:** `app/api/admin/email-templates/preview/route.ts`

**POST:** Generate preview with sample data
```typescript
POST /api/admin/email-templates/preview
Body: { type, subject, htmlBody }
Response: { html: string, subject: string }
```

---

## 🎯 Phase 3: Admin UI Components

### Step 3.1: Email Template Editor Component
**File:** `components/EmailTemplateEditor.tsx`

Features:
- Subject line input
- HTML body textarea
- Available variables list
- Enable/disable toggle
- Save button
- Loading states

### Step 3.2: Email Template Preview Component
**File:** `components/EmailTemplatePreview.tsx`

Features:
- Modal or drawer display
- Render HTML preview
- Close button
- Responsive design

### Step 3.3: Template Variables Reference
**File:** `components/TemplateVariablesReference.tsx`

Features:
- Collapsible panel
- List all available variables for selected type
- Copy to clipboard functionality
- Descriptions for each variable

---

## 🎯 Phase 4: Admin Page

### Step 4.1: Email Templates Admin Page
**File:** `app/admin/email-templates/page.tsx`

Features:
- Tab navigation (3 tabs)
- Load templates on mount
- Pass template to editor
- Handle save action
- Success/error notifications

Layout:
```
┌─────────────────────────────────────┐
│ Email Templates                     │
├─────────────────────────────────────┤
│ [Code Created] [Admin Alert] [Winner]
├─────────────────────────────────────┤
│ <EmailTemplateEditor />             │
├─────────────────────────────────────┤
│ <TemplateVariablesReference />      │
└─────────────────────────────────────┘
```

### Step 4.2: Add to Admin Navigation
**File:** `app/admin/page.tsx`

Add link to email templates page in admin dashboard

---

## 🎯 Phase 5: Email Integration Updates

### Step 5.1: Update Code Generation Email
**File:** `app/api/admin/codes/generate/route.ts`

After creating codes, send CODE_CREATED email:
```typescript
for (const code of codes) {
  await sendTemplatedEmail('CODE_CREATED', {
    to: code.email,
    variables: {
      customer_name: code.name,
      customer_email: code.email,
      spin_code: code.code,
      code_value: '$1,000',
      spin_url: process.env.NEXT_PUBLIC_APP_URL,
      expiry_date: 'N/A', // or calculate
      current_year: new Date().getFullYear(),
      app_name: 'Ateres Kallah'
    }
  })
}
```

### Step 5.2: Update Spin Email Notifications
**File:** `app/api/spin/route.ts`

Replace current email with templated emails:

**Admin notification:**
```typescript
await sendTemplatedEmail('ADMIN_WIN_NOTIFICATION', {
  to: process.env.ADMIN_EMAIL,
  variables: {
    prize_name: result.prize.title,
    prize_description: result.prize.description,
    winner_name: codeData.name,
    winner_email: codeData.email,
    spin_code: code,
    won_at: new Date().toLocaleString(),
    admin_panel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/winners`,
    app_name: 'Ateres Kallah'
  }
})
```

**Winner confirmation:**
```typescript
await sendTemplatedEmail('WINNER_CONFIRMATION', {
  to: codeData.email,
  variables: {
    winner_name: codeData.name,
    prize_name: result.prize.title,
    prize_description: result.prize.description,
    prize_image_url: result.prize.imageUrl || '',
    spin_code: code,
    won_at: new Date().toLocaleString(),
    contact_email: process.env.ADMIN_EMAIL,
    app_name: 'Ateres Kallah'
  }
})
```

### Step 5.3: Remove Old Email Code
**File:** `lib/email.ts`

Keep the file but mark old `sendWinNotification` as deprecated or remove it entirely once new system is working.

---

## 🎯 Phase 6: Testing & Refinement

### Step 6.1: Unit Tests
Test files to create:
- `lib/email-templates.test.ts` - Template processing logic
- Variable replacement accuracy
- Missing variable handling
- Conditional logic (if needed)

### Step 6.2: Integration Tests
- Create test code → verify email sent
- Spin wheel → verify both emails sent
- Update template → verify changes reflected
- Disable template → verify no email sent

### Step 6.3: Manual Testing Checklist
- [ ] All three templates display correctly in admin
- [ ] Variable reference shows correct variables
- [ ] Preview function works with sample data
- [ ] Templates can be saved and updated
- [ ] Enable/disable toggle works
- [ ] Code creation sends email to customer
- [ ] Win sends email to admin
- [ ] Win sends email to winner
- [ ] Emails are mobile-responsive
- [ ] All variables are correctly replaced
- [ ] Email links work correctly

---

## 🎯 Phase 7: Documentation & Deployment

### Step 7.1: Update Documentation
Files to update:
- `README.md` - Add email templates section
- `SETUP.md` - Add email configuration steps
- Create `EMAIL_TEMPLATES_GUIDE.md` - Admin user guide

### Step 7.2: Environment Variables
Update `.env.example`:
```env
# Email Configuration
RESEND_API_KEY="re_..."
EMAIL_FROM="Ateres Kallah <noreply@yourdomain.com>"
ADMIN_EMAIL="admin@example.com"
```

### Step 7.3: Production Deployment
1. Run database migration on production
2. Seed email templates on production
3. Verify environment variables
4. Test email sending in production
5. Monitor Resend dashboard for errors

---

## 📊 Implementation Checklist

### Phase 1: Database & Core ✅
- [ ] Update Prisma schema
- [ ] Create and run migration
- [ ] Create seed script
- [ ] Run seed to populate defaults
- [ ] Create email-templates.ts service
- [ ] Test template processing logic

### Phase 2: API Routes ✅
- [ ] Create GET /api/admin/email-templates
- [ ] Create PUT /api/admin/email-templates
- [ ] Create GET /api/admin/email-templates/[type]
- [ ] Create POST /api/admin/email-templates/preview
- [ ] Test all API endpoints

### Phase 3: Components ✅
- [ ] Create EmailTemplateEditor component
- [ ] Create EmailTemplatePreview component
- [ ] Create TemplateVariablesReference component
- [ ] Test component rendering

### Phase 4: Admin Page ✅
- [ ] Create email templates admin page
- [ ] Add tab navigation
- [ ] Integrate components
- [ ] Add to admin navigation
- [ ] Test full page flow

### Phase 5: Integration ✅
- [ ] Update code generation to send emails
- [ ] Update spin to send admin email
- [ ] Update spin to send winner email
- [ ] Remove/deprecate old email code
- [ ] Test all email triggers

### Phase 6: Testing ✅
- [ ] Create unit tests
- [ ] Run integration tests
- [ ] Complete manual testing checklist
- [ ] Fix any bugs found

### Phase 7: Deployment ✅
- [ ] Update documentation
- [ ] Update environment variables
- [ ] Deploy to production
- [ ] Verify production emails
- [ ] Monitor for issues

---

## 🚀 Quick Start Implementation Order

For fastest implementation, do in this order:

**Day 1: Foundation**
1. Phase 1.1 - Database schema
2. Phase 1.2 - Seed data
3. Phase 1.3 - Email service
4. Test template processing manually

**Day 2: Backend**
5. Phase 2 - All API routes
6. Test APIs with Postman/Thunder Client

**Day 3: Frontend**
7. Phase 3 - All components
8. Phase 4 - Admin page
9. Test admin UI

**Day 4: Integration & Testing**
10. Phase 5 - Update email integrations
11. Phase 6 - Testing
12. Fix bugs

**Day 5: Polish & Deploy**
13. Phase 7 - Documentation
14. Deploy to production
15. Monitor and adjust

---

## 💡 Tips for Success

1. **Start with database** - Get the schema right first
2. **Test each phase** - Don't move forward until current phase works
3. **Use default templates** - Copy from the design doc
4. **Test emails in dev** - Use real email addresses you control
5. **Check Resend dashboard** - Monitor for delivery issues
6. **Keep backups** - Save template content before making changes
7. **Mobile test** - Check emails on phone before going live

---

## 🆘 Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set
- Verify EMAIL_FROM domain is verified
- Check Resend dashboard for errors
- Ensure template isActive = true

**Variables not replacing?**
- Check spelling matches exactly
- Verify variable is passed in data object
- Check processTemplate function logic

**Template not saving?**
- Check API authentication
- Verify PUT request body format
- Check database connection

**Preview not working?**
- Verify preview API returns HTML
- Check sample data includes all variables
- Test HTML rendering in browser

---

## 📞 Support

**Questions about:**
- Database: Check Prisma docs
- Emails: Check Resend docs
- React: Check Next.js docs
- Design: See EMAIL_TEMPLATE_SYSTEM.md

---

**Total Estimated Time:** 4-5 development days
**Priority:** High - Improves customer communication
**Status:** Ready to implement
