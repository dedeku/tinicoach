/**
 * Password Hashing Utilities
 *
 * Provides secure password hashing and verification using bcrypt
 * with a cost factor of 12 as per security requirements.
 */

import bcrypt from 'bcryptjs'

// Cost factor for bcrypt (12 = ~300ms hash time, good security/performance balance)
const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 *
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  return hashedPassword
}

/**
 * Verify a plain text password against a hashed password
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPassword)
  return isValid
}

/**
 * Validate password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 *
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  error?: string
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'A jelszónak tartalmaznia kell legalább 1 nagybetűt',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'A jelszónak tartalmaznia kell legalább 1 kisbetűt',
    }
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'A jelszónak tartalmaznia kell legalább 1 számot',
    }
  }

  return { isValid: true }
}
