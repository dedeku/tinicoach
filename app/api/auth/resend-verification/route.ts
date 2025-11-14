/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification email
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resendVerificationSchema } from '@/lib/validation'
import { createEmailVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = resendVerificationSchema.parse(body)

    // Rate limiting check (per email to prevent abuse)
    const rateLimitResult = await rateLimit(
      RATE_LIMITS.EMAIL_VERIFICATION,
      () => `email-verification:${validatedData.email}`
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
        emailVerified: true,
        status: true,
      },
    })

    // Check if user exists and is active
    if (!user || user.status !== 'ACTIVE') {
      // Silent fail for security
      return NextResponse.json(
        {
          success: true,
          message: 'Ha az email cím létezik és még nincs megerősítve, küldtünk egy új megerősítő emailt.',
        },
        {
          status: 200,
          headers: rateLimitResult.rateLimitHeaders,
        }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Ez az email cím már meg van erősítve' },
        { status: 400 }
      )
    }

    // Generate new email verification token
    const verificationToken = await createEmailVerificationToken(user.id)

    // Create verification link
    const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationLink)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { error: 'Nem sikerült az email küldése. Kérlek, próbáld újra később.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Új megerősítő emailt küldtünk. Kérlek, ellenőrizd a postafiókodat.',
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
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
