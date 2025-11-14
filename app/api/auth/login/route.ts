/**
 * POST /api/auth/login
 *
 * Login with email and password
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { loginSchema } from '@/lib/validation'
import { createSession, setSessionCookie } from '@/lib/session'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimit(RATE_LIMITS.LOGIN)(request)
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        nickname: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    })

    // Check if user exists and has a password
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      )
    }

    // Check account status
    if (user.status === 'DELETED') {
      return NextResponse.json(
        { error: 'Ez a fiók törölve lett. Használd a visszaállítási linket az emailben.' },
        { status: 403 }
      )
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Ez a fiók fel van függesztve. Lépj kapcsolatba az ügyfélszolgálattal.' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      )
    }

    // Create session
    const sessionToken = await createSession(
      user.id,
      validatedData.rememberMe || false
    )

    // Set session cookie
    await setSessionCookie(sessionToken, validatedData.rememberMe || false)

    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Return success with user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        message: 'Sikeres bejelentkezés!',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          nickname: user.nickname,
          role: user.role,
          emailVerified: user.emailVerified,
        },
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
