/**
 * Token Generation and Verification Utilities
 *
 * Handles creation and validation of tokens for:
 * - Email verification
 * - Password reset
 * - Account reactivation
 */

import { prisma } from './prisma'
import { TokenType } from '@prisma/client'
import crypto from 'crypto'

// Token expiry durations
const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 24 * 60 * 60 * 1000,      // 24 hours
  REACTIVATION: 30 * 24 * 60 * 60 * 1000,   // 30 days
}

/**
 * Generate a secure random token
 *
 * @returns 32-byte random token as hex string
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create an email verification token
 *
 * @param userId - User ID to create token for
 * @returns Generated token string
 */
export async function createEmailVerificationToken(
  userId: string
): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION)

  // Delete any existing email verification tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: TokenType.EMAIL_VERIFICATION,
    },
  })

  // Create new token
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt,
    },
  })

  return token
}

/**
 * Create a password reset token
 *
 * @param userId - User ID to create token for
 * @returns Generated token string
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET)

  // Delete any existing password reset tokens for this user
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: TokenType.PASSWORD_RESET,
    },
  })

  // Create new token
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    },
  })

  return token
}

/**
 * Create an account reactivation token
 *
 * @param userId - User ID to create token for
 * @returns Generated token string
 */
export async function createReactivationToken(userId: string): Promise<string> {
  const token = generateSecureToken()

  // Update user with reactivation token
  await prisma.user.update({
    where: { id: userId },
    data: { reactivationToken: token },
  })

  return token
}

/**
 * Verify an email verification token
 *
 * @param token - Token to verify
 * @returns User ID if valid, null if invalid or expired
 */
export async function verifyEmailVerificationToken(
  token: string
): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
      type: TokenType.EMAIL_VERIFICATION,
    },
  })

  if (!verificationToken) {
    return null
  }

  // Check if token is expired
  if (verificationToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return null
  }

  return verificationToken.userId
}

/**
 * Verify a password reset token
 *
 * @param token - Token to verify
 * @returns User ID if valid, null if invalid or expired
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
      type: TokenType.PASSWORD_RESET,
    },
  })

  if (!verificationToken) {
    return null
  }

  // Check if token is expired
  if (verificationToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return null
  }

  return verificationToken.userId
}

/**
 * Verify a reactivation token
 *
 * @param token - Token to verify
 * @returns User if valid, null if invalid or expired (>30 days)
 */
export async function verifyReactivationToken(token: string): Promise<{
  userId: string
  deletedAt: Date
} | null> {
  const user = await prisma.user.findUnique({
    where: { reactivationToken: token },
    select: {
      id: true,
      deletedAt: true,
      status: true,
    },
  })

  if (!user || !user.deletedAt || user.status !== 'DELETED') {
    return null
  }

  // Check if more than 30 days have passed since deletion
  const deletionDate = new Date(user.deletedAt)
  const expiryDate = new Date(deletionDate.getTime() + TOKEN_EXPIRY.REACTIVATION)

  if (expiryDate < new Date()) {
    return null
  }

  return {
    userId: user.id,
    deletedAt: user.deletedAt,
  }
}

/**
 * Delete a token after use
 *
 * @param token - Token to delete
 * @param type - Type of token to delete
 */
export async function deleteToken(
  token: string,
  type: TokenType
): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: {
      token,
      type,
    },
  })
}

/**
 * Delete all tokens for a user
 *
 * @param userId - User ID
 * @param type - Optional: specific token type to delete, or all if not specified
 */
export async function deleteUserTokens(
  userId: string,
  type?: TokenType
): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      ...(type && { type }),
    },
  })
}
