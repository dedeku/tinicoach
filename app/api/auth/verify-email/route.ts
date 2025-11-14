/**
 * GET /api/auth/verify-email?token=xxx
 *
 * Verify email address with token
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailVerificationToken, deleteToken } from '@/lib/tokens'
import { TokenType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Get token from query params
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token hiányzik' },
        { status: 400 }
      )
    }

    // Verify token
    const userId = await verifyEmailVerificationToken(token)

    if (!userId) {
      return NextResponse.json(
        { error: 'Érvénytelen vagy lejárt token' },
        { status: 400 }
      )
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })

    // Delete email verification token
    await deleteToken(token, TokenType.EMAIL_VERIFICATION)

    return NextResponse.json(
      {
        success: true,
        message: 'Email cím sikeresen megerősítve!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
