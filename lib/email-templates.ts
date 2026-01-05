/**
 * Email Template Service
 * 
 * Handles email template retrieval, variable processing, and sending
 */

import { prisma } from './prisma'
import { Resend } from 'resend'

interface TemplateVariables {
  [key: string]: string | number | boolean | undefined
}

interface EmailData {
  to: string | string[]
  variables: TemplateVariables
}

/**
 * Get an email template by type
 */
export async function getTemplate(type: string) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { type }
    })
    return template
  } catch (error) {
    console.error(`Error fetching template ${type}:`, error)
    return null
  }
}

/**
 * Get all email templates
 */
export async function getAllTemplates() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { type: 'asc' }
    })
    return templates
  } catch (error) {
    console.error('Error fetching all templates:', error)
    return []
  }
}

/**
 * Process template string by replacing variables
 * Variables are in format {{variable_name}}
 */
export function processTemplate(template: string, variables: TemplateVariables): string {
  let processed = template

  // Replace all {{variable}} with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g')
    const value = variables[key] !== undefined ? String(variables[key]) : ''
    processed = processed.replace(placeholder, value)
  })

  // Remove any unreplaced variables (show as empty)
  processed = processed.replace(/{{[^}]+}}/g, '')

  return processed
}

/**
 * Send templated email using Resend
 */
export async function sendTemplatedEmail(type: string, data: EmailData): Promise<boolean> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email:', type)
    return false
  }

  try {
    // Get template from database
    const template = await getTemplate(type)
    
    if (!template) {
      console.error(`Template not found: ${type}`)
      return false
    }

    // Check if template is active
    if (!template.isActive) {
      console.log(`Template ${type} is disabled, skipping email`)
      return false
    }

    // Process subject and body with variables
    const subject = processTemplate(template.subject, data.variables)
    const htmlBody = processTemplate(template.htmlBody, data.variables)
    const textBody = template.textBody 
      ? processTemplate(template.textBody, data.variables) 
      : undefined

    // Send email with Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Ateres Kallah <noreply@yourdomain.com>',
      to: Array.isArray(data.to) ? data.to : [data.to],
      subject,
      html: htmlBody,
      text: textBody
    })

    console.log(`✅ Email sent successfully [${type}]:`, result)
    return true
  } catch (error) {
    console.error(`❌ Failed to send email [${type}]:`, error)
    return false
  }
}

/**
 * Update an email template
 */
export async function updateTemplate(
  type: string, 
  data: {
    subject?: string
    htmlBody?: string
    textBody?: string | null
    isActive?: boolean
  }
) {
  try {
    const template = await prisma.emailTemplate.update({
      where: { type },
      data
    })
    return template
  } catch (error) {
    console.error(`Error updating template ${type}:`, error)
    throw error
  }
}

/**
 * Preview an email template with sample data
 */
export function previewTemplate(
  subject: string,
  htmlBody: string,
  variables: TemplateVariables
): { subject: string; html: string } {
  const processedSubject = processTemplate(subject, variables)
  const processedHtml = processTemplate(htmlBody, variables)
  
  return {
    subject: processedSubject,
    html: processedHtml
  }
}

/**
 * Get sample variables for each template type
 */
export function getSampleVariables(type: string): TemplateVariables {
  const baseVariables = {
    app_name: 'Ateres Kallah',
    current_year: new Date().getFullYear()
  }

  switch (type) {
    case 'CODE_CREATED':
      return {
        ...baseVariables,
        customer_name: 'Sarah Cohen',
        customer_email: 'sarah@example.com',
        spin_code: 'AK-2026-ABC123',
        code_value: '$1,000',
        spin_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        expiry_date: 'December 31, 2026'
      }
    
    case 'ADMIN_WIN_NOTIFICATION':
      return {
        ...baseVariables,
        prize_name: 'Diamond Necklace',
        prize_description: 'Beautiful diamond necklace with 18k gold chain',
        winner_name: 'Sarah Cohen',
        winner_email: 'sarah@example.com',
        spin_code: 'AK-2026-ABC123',
       won_at: new Date().toLocaleString(),
        admin_panel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/winners`
      }
    
    case 'WINNER_CONFIRMATION':
      return {
        ...baseVariables,
        winner_name: 'Sarah Cohen',
        prize_name: 'Diamond Necklace',
        prize_description: 'Beautiful diamond necklace with 18k gold chain',
        prize_image_url: '',
        spin_code: 'AK-2026-ABC123',
        won_at: new Date().toLocaleString(),
        contact_email: process.env.ADMIN_EMAIL || 'admin@example.com'
      }
    
    default:
      return baseVariables
  }
}

/**
 * Get available variables for a template type
 */
export function getAvailableVariables(type: string): Array<{ name: string; description: string }> {
  const baseVariables = [
    { name: 'app_name', description: 'Application name (Ateres Kallah)' },
    { name: 'current_year', description: 'Current year (e.g., 2026)' }
  ]

  switch (type) {
    case 'CODE_CREATED':
      return [
        ...baseVariables,
        { name: 'customer_name', description: "Customer's name" },
        { name: 'customer_email', description: "Customer's email address" },
        { name: 'spin_code', description: 'The generated spin code (e.g., AK-2026-ABC123)' },
        { name: 'code_value', description: 'Value of the code (e.g., $1,000)' },
        { name: 'spin_url', description: 'URL to spin the wheel' },
        { name: 'expiry_date', description: 'Code expiration date (if applicable)' }
      ]
    
    case 'ADMIN_WIN_NOTIFICATION':
      return [
        ...baseVariables,
        { name: 'prize_name', description: 'Name of the won prize' },
        { name: 'prize_description', description: 'Full description of the prize' },
        { name: 'winner_name', description: "Winner's name" },
        { name: 'winner_email', description: "Winner's email address" },
        { name: 'spin_code', description: 'Code that was used to spin' },
        { name: 'won_at', description: 'Timestamp when prize was won' },
        { name: 'admin_panel_url', description: 'Link to admin panel' }
      ]
    
    case 'WINNER_CONFIRMATION':
      return [
        ...baseVariables,
        { name: 'winner_name', description: "Winner's name" },
        { name: 'prize_name', description: 'Name of the won prize' },
        { name: 'prize_description', description: 'Full description of the prize' },
        { name: 'prize_image_url', description: 'Image URL of the prize (if available)' },
        { name: 'spin_code', description: 'Code that was used to spin' },
        { name: 'won_at', description: 'Timestamp when prize was won' },
        { name: 'contact_email', description: 'Admin/contact email address' }
      ]
    
    default:
      return baseVariables
  }
}
