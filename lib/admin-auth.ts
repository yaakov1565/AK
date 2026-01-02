/**
 * Admin authentication with session management and timeout
 * Uses encrypted session tokens with expiration
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-in-production'
const SESSION_TIMEOUT_HOURS = 4 // Session expires after 4 hours
const ENCRYPTION_KEY = process.env.SESSION_SECRET || 'change-this-secret-key-in-production'

// Create a hash of the password to validate sessions
function getPasswordHash(): string {
  return crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex')
}

interface SessionData {
  authenticated: boolean
  timestamp: number
  passwordHash: string // Hash of password at session creation time
}

/**
 * Encrypt session data
 */
function encrypt(data: SessionData): string {
  const text = JSON.stringify(data)
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt session data
 */
function decrypt(encryptedData: string): SessionData | null {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 2) return null
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch (error) {
    return null
  }
}

/**
 * Check if the current user is authenticated as admin
 * Validates session exists, hasn't expired, and password hasn't changed
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)
  
  if (!sessionCookie?.value) {
    return false
  }

  const sessionData = decrypt(sessionCookie.value)
  
  if (!sessionData || !sessionData.authenticated) {
    return false
  }

  // Check if password has changed since session was created
  const currentPasswordHash = getPasswordHash()
  if (sessionData.passwordHash !== currentPasswordHash) {
    // Password changed, session is invalid
    // Note: Session will be cleared on next login or logout
    return false
  }

  // Check if session has expired
  const sessionAge = Date.now() - sessionData.timestamp
  const maxAge = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000 // Convert hours to milliseconds
  
  if (sessionAge > maxAge) {
    // Session expired
    // Note: Session will be cleared on next login or logout
    return false
  }

  return true
}

/**
 * Authenticate admin with password
 */
export function authenticateAdmin(password: string): boolean {
  return password === ADMIN_PASSWORD
}

/**
 * Set admin session cookie with encrypted session data
 */
export async function setAdminSession() {
  const sessionData: SessionData = {
    authenticated: true,
    timestamp: Date.now(),
    passwordHash: getPasswordHash(), // Store password hash for validation
  }
  
  const encryptedSession = encrypt(sessionData)
  const cookieStore = await cookies()
  
  cookieStore.set(ADMIN_SESSION_COOKIE, encryptedSession, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection (changed from 'lax' to 'strict')
    maxAge: SESSION_TIMEOUT_HOURS * 60 * 60, // Session expires after timeout
    path: '/', // Available across the site
  })
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

/**
 * Get remaining session time in minutes
 */
export async function getSessionTimeRemaining(): Promise<number | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)
  
  if (!sessionCookie?.value) {
    return null
  }

  const sessionData = decrypt(sessionCookie.value)
  
  if (!sessionData) {
    return null
  }

  const sessionAge = Date.now() - sessionData.timestamp
  const maxAge = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000
  const remaining = maxAge - sessionAge
  
  return remaining > 0 ? Math.floor(remaining / 60000) : 0 // Convert to minutes
}
