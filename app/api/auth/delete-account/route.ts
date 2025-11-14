/**
 * POST /api/auth/delete-account
 *
 * Soft delete user account (30-day reactivation window)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, logoutAllDevices } from '@/lib/session'
import { createReactivationToken } from '@/lib/tokens'
import { sendAccountDeletionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nem vagy bejelentkezve' },
        { status: 401 }
      )
    }

    // Get full user data
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
      },
    })

    if (!fullUser || fullUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Felhasználó nem található vagy nem aktív' },
        { status: 404 }
      )
    }

    // Generate reactivation token
    const reactivationToken = await createReactivationToken(fullUser.id)

    // Soft delete account
    await prisma.user.update({
      where: { id: fullUser.id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    })

    // Logout from all devices
    await logoutAllDevices(fullUser.id)

    // Create reactivation link
    const reactivationLink = `${process.env.NEXTAUTH_URL}/auth/reactivate-account?token=${reactivationToken}`

    // Send account deletion email with reactivation link
    try {
      await sendAccountDeletionEmail(
        fullUser.email,
        fullUser.fullName,
        reactivationLink
      )
    } catch (emailError) {
      console.error('Failed to send account deletion email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Fiók sikeresen törölve. 30 napod van újraaktíválni a fiókodat az emailben küldött link segítségével.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
