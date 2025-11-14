/**
 * POST /api/auth/logout-all
 *
 * Logout from all devices (invalidate all sessions)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, logoutAllDevices } from '@/lib/session'

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

    // Logout from all devices
    await logoutAllDevices(user.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Kijelentkeztél az összes eszközről',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout all error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
