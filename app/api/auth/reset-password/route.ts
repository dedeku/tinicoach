/**
 * POST /api/auth/reset-password
 *
 * Reset password with token
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { resetPasswordSchema } from '@/lib/validation'
import { verifyPasswordResetToken, deleteToken } from '@/lib/tokens'
import { deleteAllUserSessions } from '@/lib/session'
import { sendPasswordChangedEmail } from '@/lib/email'
import { ZodError } from 'zod'
import { TokenType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Verify token
    const userId = await verifyPasswordResetToken(validatedData.token)

    if (!userId) {
      return NextResponse.json(
        { error: 'Érvénytelen vagy lejárt token' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
      },
    })

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Felhasználó nem található vagy nem aktív' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword)

    // Update user password and passwordChangedAt
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    })

    // Delete password reset token
    await deleteToken(validatedData.token, TokenType.PASSWORD_RESET)

    // Invalidate all existing sessions
    await deleteAllUserSessions(userId)

    // Send password changed confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.fullName)
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Jelszó sikeresen megváltoztatva. Mostantól bejelentkezhetsz az új jelszóval.',
      },
      { status: 200 }
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
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
