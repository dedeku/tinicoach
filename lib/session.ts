/**
 * Session Management Utilities
 *
 * Handles user session creation, validation, and deletion
 */

import { prisma } from './prisma'
import crypto from 'crypto'
import { cookies } from 'next/headers'

// Session duration constants
const SESSION_DURATION = {
  DEFAULT: 28 * 24 * 60 * 60 * 1000, // 28 days
  BROWSER_CLOSE: 0, // Session cookie (expires when browser closes)
}

const SESSION_COOKIE_NAME = 'tinicoach-session'

/**
 * Generate a secure session token
 *
 * @returns Random session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create a new session for a user
 *
 * @param userId - User ID
 * @param rememberMe - Whether to create persistent session (28 days) or browser-close session
 * @returns Session token
 */
export async function createSession(
  userId: string,
  rememberMe: boolean = false
): Promise<string> {
  const sessionToken = generateSessionToken()
  const duration = rememberMe
    ? SESSION_DURATION.DEFAULT
    : SESSION_DURATION.BROWSER_CLOSE

  // Calculate expiry date
  const expiresAt = duration > 0
    ? new Date(Date.now() + duration)
    : new Date(Date.now() + SESSION_DURATION.DEFAULT) // Even browser-close sessions need DB expiry

  // Create session in database
  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  })

  return sessionToken
}

/**
 * Set session cookie in response
 *
 * @param sessionToken - Session token to set
 * @param rememberMe - Whether to create persistent cookie
 */
export async function setSessionCookie(
  sessionToken: string,
  rememberMe: boolean = false
): Promise<void> {
  const cookieStore = await cookies()
  const maxAge = rememberMe ? SESSION_DURATION.DEFAULT / 1000 : undefined // Convert to seconds

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(maxAge && { maxAge }),
  })
}

/**
 * Get session token from cookies
 *
 * @returns Session token or null
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)
  return cookie?.value || null
}

/**
 * Validate a session token and return user if valid
 *
 * @param sessionToken - Session token to validate
 * @returns User object if session is valid, null otherwise
 */
export async function validateSession(sessionToken: string): Promise<{
  id: string
  email: string
  fullName: string
  nickname: string
  role: string
  emailVerified: boolean
} | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          nickname: true,
          role: true,
          emailVerified: true,
          status: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({
      where: { id: session.id },
    })
    return null
  }

  // Check if user account is active
  if (session.user.status !== 'ACTIVE') {
    return null
  }

  return session.user
}

/**
 * Get current user from session cookie
 *
 * @returns User object if logged in, null otherwise
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  fullName: string
  nickname: string
  role: string
  emailVerified: boolean
} | null> {
  const sessionToken = await getSessionToken()
  if (!sessionToken) {
    return null
  }

  return validateSession(sessionToken)
}

/**
 * Delete a specific session
 *
 * @param sessionToken - Session token to delete
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken },
  })
}

/**
 * Delete all sessions for a user
 *
 * @param userId - User ID
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Delete current session and clear cookie
 */
export async function logout(): Promise<void> {
  const sessionToken = await getSessionToken()
  if (sessionToken) {
    await deleteSession(sessionToken)
  }
  await clearSessionCookie()
}

/**
 * Delete all user sessions and clear cookie
 *
 * @param userId - User ID
 */
export async function logoutAllDevices(userId: string): Promise<void> {
  await deleteAllUserSessions(userId)
  await clearSessionCookie()
}
