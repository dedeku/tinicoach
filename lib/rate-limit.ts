/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for protecting authentication endpoints
 *
 * Limits per endpoint:
 * - Login: 5 attempts / 15 minutes per IP
 * - Password reset: 3 requests / hour per email
 * - Email verification resend: 3 requests / hour per email
 * - Registration: 5 registrations / hour per IP
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  EMAIL_VERIFICATION: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  REGISTRATION: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
}

/**
 * Get client IP address from request
 *
 * @param request - Next.js request object
 * @returns Client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Check rate limit for a given key
 *
 * @param key - Unique identifier for rate limiting (e.g., IP address + endpoint)
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining attempts
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // No entry or expired entry - create new one
    const resetAt = now + windowMs
    rateLimitStore.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    }
  }

  // Entry exists and is valid
  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  // Increment count
  entry.count += 1
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Rate limit middleware factory
 *
 * @param config - Rate limit configuration
 * @param keyGenerator - Optional custom key generator function
 * @returns Middleware function
 */
export function rateLimit(
  config: { maxAttempts: number; windowMs: number },
  keyGenerator?: (request: NextRequest) => string
) {
  return async (request: NextRequest) => {
    const key = keyGenerator
      ? keyGenerator(request)
      : `${getClientIp(request)}:${request.nextUrl.pathname}`

    const result = checkRateLimit(key, config.maxAttempts, config.windowMs)

    if (!result.allowed) {
      const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Túl sok kérés. Kérlek, próbáld újra később.',
          retryAfter: resetInSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetInSeconds.toString(),
            'X-RateLimit-Limit': config.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toString(),
          },
        }
      )
    }

    // Add rate limit headers to response
    return {
      rateLimitHeaders: {
        'X-RateLimit-Limit': config.maxAttempts.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toString(),
      },
    }
  }
}

/**
 * Reset rate limit for a key (useful for testing or after successful operations)
 *
 * @param key - Rate limit key to reset
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
