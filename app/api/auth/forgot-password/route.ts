/**
 * POST /api/auth/forgot-password
 *
 * Request password reset email
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validation'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Rate limiting check (per email to prevent abuse)
    const rateLimitResult = await rateLimit(
      RATE_LIMITS.PASSWORD_RESET,
      () => `password-reset:${validatedData.email}`
    )(request)

    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult // Rate limit exceeded
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
      },
    })

    // Silent fail for security (don't reveal if email exists)
    // But still send email if user exists and is active
    if (user && user.status === 'ACTIVE') {
      // Generate password reset token
      const resetToken = await createPasswordResetToken(user.id)

      // Create reset link
      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, user.fullName, resetLink)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Always return success (security best practice)
    return NextResponse.json(
      {
        success: true,
        message: 'Ha az email cím létezik, küldtünk egy jelszó visszaállítási linket.',
      },
      {
        status: 200,
        headers: rateLimitResult.rateLimitHeaders,
      }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Hibás adatok',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
