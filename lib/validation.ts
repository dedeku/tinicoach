/**
 * Validation Schemas
 *
 * Zod schemas for validating authentication-related data
 */

import { z } from 'zod'

/**
 * Password validation schema
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
const passwordSchema = z
  .string()
  .min(8, 'A jelszónak legalább 8 karakter hosszúnak kell lennie')
  .regex(/[A-Z]/, 'A jelszónak tartalmaznia kell legalább 1 nagybetűt')
  .regex(/[a-z]/, 'A jelszónak tartalmaznia kell legalább 1 kisbetűt')
  .regex(/\d/, 'A jelszónak tartalmaznia kell legalább 1 számot')

/**
 * Email validation schema
 */
const emailSchema = z
  .string()
  .email('Kérlek, adj meg egy érvényes email címet')
  .max(255, 'Az email cím túl hosszú')
  .toLowerCase()
  .trim()

/**
 * Registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(1, 'A teljes név megadása kötelező')
    .max(100, 'A teljes név túl hosszú')
    .trim(),
  nickname: z
    .string()
    .min(1, 'A becenév megadása kötelező')
    .max(50, 'A becenév túl hosszú')
    .trim(),
  birthdate: z
    .string()
    .or(z.date())
    .refine(
      (date) => {
        const birthDate = typeof date === 'string' ? new Date(date) : date
        return birthDate < new Date()
      },
      { message: 'A születési dátum nem lehet jövőbeli' }
    ),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'El kell fogadnod a felhasználási feltételeket',
    }),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'A jelszó megadása kötelező'),
  rememberMe: z.boolean(),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token hiányzik'),
  newPassword: passwordSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Email verification schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token hiányzik'),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

/**
 * Account reactivation schema
 */
export const reactivateAccountSchema = z.object({
  token: z.string().min(1, 'Token hiányzik'),
})

export type ReactivateAccountInput = z.infer<typeof reactivateAccountSchema>
