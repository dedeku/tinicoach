/**
 * POST /api/auth/reactivate-account
 *
 * Reactivate a soft-deleted account (within 30 days)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reactivateAccountSchema } from '@/lib/validation'
import { verifyReactivationToken } from '@/lib/tokens'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = reactivateAccountSchema.parse(body)

    // Verify reactivation token
    const result = await verifyReactivationToken(validatedData.token)

    if (!result) {
      return NextResponse.json(
        { error: 'Érvénytelen vagy lejárt token. A fiók nem állítható vissza.' },
        { status: 400 }
      )
    }

    // Reactivate account
    await prisma.user.update({
      where: { id: result.userId },
      data: {
        status: 'ACTIVE',
        deletedAt: null,
        reactivationToken: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Fiók sikeresen újraaktiválva! Mostantól bejelentkezhetsz.',
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
    console.error('Reactivate account error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
