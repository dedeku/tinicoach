/**
 * POST /api/auth/register
 *
 * Register a new user with email and password
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { registerSchema } from '@/lib/validation'
import { createEmailVerificationToken } from '@/lib/tokens'
import { sendWelcomeEmail } from '@/lib/email'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimit(RATE_LIMITS.REGISTRATION)(request)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ez az email cím már regisztrálva van' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Convert birthdate to Date object if it's a string
    const birthdate = typeof validatedData.birthdate === 'string'
      ? new Date(validatedData.birthdate)
      : validatedData.birthdate

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        fullName: validatedData.fullName,
        nickname: validatedData.nickname,
        birthdate,
        termsAcceptedAt: new Date(),
        emailVerified: false,
        status: 'ACTIVE',
        role: 'TEEN',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickname: true,
        createdAt: true,
      },
    })

    // Generate email verification token
    const verificationToken = await createEmailVerificationToken(user.id)

    // Create verification link
    const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`

    // Send welcome email with verification link
    try {
      await sendWelcomeEmail(user.email, user.fullName, verificationLink)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    // Return success (don't auto-login)
    return NextResponse.json(
      {
        success: true,
        message: 'Sikeres regisztráció! Küldtünk egy megerősítő emailt.',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nickname: user.nickname,
        },
      },
      {
        status: 201,
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
