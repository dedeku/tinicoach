/**
 * POST /api/auth/logout
 *
 * Logout from current session
 */

import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Logout (delete current session and clear cookie)
    await logout()

    return NextResponse.json(
      {
        success: true,
        message: 'Sikeres kijelentkezés',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba történt. Kérlek, próbáld újra később.' },
      { status: 500 }
    )
  }
}
