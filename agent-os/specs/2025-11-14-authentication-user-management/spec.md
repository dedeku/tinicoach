# Specification: Authentication & User Management

## Goal
Build a complete, GDPR-compliant authentication system for tinicoach that supports email/password registration, social authentication (Google, Facebook, Apple), email verification, password reset, session management, and transactional emails for Hungarian teenagers aged 13-18.

## User Stories
- As a new user, I want to register with my email and password so that I can access the platform
- As a new user, I want to register with Google/Facebook/Apple so that I can quickly create an account
- As a registered user, I want to verify my email address so that my account is fully activated
- As a registered user, I want to reset my password if I forget it so that I can regain access to my account
- As a registered user, I want to stay logged in for 28 days so that I don't have to login repeatedly
- As a registered user, I want to logout from all devices so that I can secure my account if needed
- As a registered user, I want to delete my account so that I can remove my data from the platform
- As a deleted user, I want to reactivate my account within 30 days so that I can restore my data if I change my mind
- As a user under 16, I want the system to track my parental consent status so that future compliance features work correctly

## Core Requirements

### Functional Requirements
- Users can register with email/password (with full name, nickname, birthdate, terms acceptance)
- Users can register/login with Google, Facebook, or Apple OAuth
- Email verification link sent immediately after registration (24-hour validity)
- Users can access app without verifying email, but see persistent reminder notification
- Unverified accounts auto-delete after 30 days (with reminder emails at 7, 14, 28, 29 days)
- Password reset flow via email link (24-hour validity)
- Session management with 28-day default duration (or browser-close if "remember me" unchecked)
- Support "logout from all devices" functionality
- Soft delete with 30-day reactivation period via email link
- Track user birthdate for age verification and parental consent flags (without enforcing restrictions)
- SSO account linking when email matches existing account
- All transactional emails in Hungarian with multi-language structure

### Non-Functional Requirements
- GDPR compliance: parental consent tracking, right to deletion, 30-day reactivation window
- Password security: bcrypt hashing with cost factor 12
- Rate limiting on all auth endpoints (5 login attempts/15min, 3 reset requests/hour, 5 registrations/hour per IP)
- Secure session cookies (HttpOnly, Secure, SameSite=Lax)
- Email delivery within 1 minute
- Login response time under 500ms
- Registration response time under 1 second
- CSRF protection on all forms (handled by NextAuth.js)
- Accessibility: WCAG 2.1 AA compliance on all forms

## Visual Design
No mockups provided. Design will follow clean, minimal UI patterns:
- Centered form layouts for registration/login
- Clear error messages inline with form fields
- Primary CTA buttons for submit actions
- Toaster notification for email verification reminder (non-intrusive, dismissible)
- Responsive breakpoints: mobile-first (320px+), tablet (768px+), desktop (1024px+)

## Reusable Components

### Existing Code to Leverage
**From package.json:**
- `react-hook-form` + `zod` - Already installed, use for all form validation
- `next` v16.0.1 - App Router architecture in place
- `typescript` - Strong typing already configured
- Tailwind CSS - Styling framework in place

**Patterns from existing code:**
- App Router structure in `/app` directory
- TypeScript configuration in `tsconfig.json`
- Hungarian language default in `layout.tsx` (lang="hu")
- PWA configuration with `next-pwa` and manifest.json

### New Components Required
**Authentication UI:**
- `RegistrationForm` - Email/password registration with all required fields
- `LoginForm` - Email/password login with "remember me" option
- `SSOButtons` - Google/Facebook/Apple OAuth buttons
- `ForgotPasswordForm` - Email input for password reset request
- `ResetPasswordForm` - New password input with token validation
- `EmailVerificationToaster` - Persistent reminder notification
- `FormInput` - Reusable form field with validation error display
- `FormButton` - Reusable button with loading state
- `AuthLayout` - Layout wrapper for auth pages

**Backend Services:**
- `lib/prisma.ts` - Prisma client singleton
- `lib/auth.ts` - NextAuth.js configuration
- `lib/password.ts` - Bcrypt hashing utilities
- `lib/email.ts` - SendGrid email service
- `lib/tokens.ts` - Token generation and verification
- `lib/rate-limit.ts` - Rate limiting middleware
- `lib/validation.ts` - Zod validation schemas

**Email Templates (SendGrid):**
- Welcome email template (Hungarian)
- Email verification template (Hungarian)
- Password reset template (Hungarian)
- Password changed confirmation template (Hungarian)
- Account deletion confirmation template (Hungarian)
- Parental consent request template (Hungarian, future use)
- Unverified account reminder templates (7, 14, 28, 29 days)

## Technical Approach

### Database: Prisma Models

```prisma
// User model
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  password              String?   // Nullable for SSO-only users
  emailVerified         Boolean   @default(false)
  emailVerifiedAt       DateTime?

  // Profile
  fullName              String
  nickname              String
  birthdate             DateTime  @db.Date
  profilePicture        String?
  bio                   String?   @db.Text
  gender                Gender?

  // Metadata
  role                  UserRole  @default(TEEN)
  parentalConsentGiven  Boolean   @default(false)
  parentalConsentDate   DateTime?
  termsAcceptedAt       DateTime
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Account status
  status                AccountStatus @default(ACTIVE)
  deletedAt             DateTime?
  reactivationToken     String?   @unique

  // Sessions & security
  lastLoginAt           DateTime?
  passwordChangedAt     DateTime?

  // Account recovery (future)
  secondaryEmail        String?
  phoneNumber           String?

  // Relations
  accounts              Account[]
  sessions              Session[]
  verificationTokens    VerificationToken[]

  @@index([email])
  @@index([reactivationToken])
}

// SSO provider accounts
model Account {
  id                String    @id @default(uuid())
  userId            String
  provider          SSOProvider
  providerAccountId String
  accessToken       String?   @db.Text  // Encrypted
  refreshToken      String?   @db.Text  // Encrypted
  expiresAt         DateTime?
  createdAt         DateTime  @default(now())

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

// Email verification and password reset tokens
model VerificationToken {
  id        String            @id @default(uuid())
  userId    String
  token     String            @unique
  type      TokenType
  expiresAt DateTime
  createdAt DateTime          @default(now())

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId, type])
}

// User sessions
model Session {
  id           String   @id @default(uuid())
  userId       String
  sessionToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionToken])
  @@index([userId])
}

// Enums
enum UserRole {
  TEEN
  ADMIN
  COACH    // Future
  PARENT   // Future
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum AccountStatus {
  ACTIVE
  DELETED
  SUSPENDED
}

enum SSOProvider {
  GOOGLE
  FACEBOOK
  APPLE
}

enum TokenType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}
```

### API: Endpoints and Data Flow

**POST /api/auth/register**
- Request body: `{ email, password, fullName, nickname, birthdate, termsAccepted }`
- Validation: Email format, password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number), required fields
- Flow:
  1. Check email uniqueness
  2. Hash password with bcrypt (cost 12)
  3. Create user record (status: ACTIVE, emailVerified: false)
  4. Generate email verification token (24-hour expiry)
  5. Send welcome email with verification link
  6. Return success with user ID (do not auto-login)
- Rate limit: 5 requests/hour per IP
- Error codes: 400 (validation), 409 (email exists), 500 (server error)

**POST /api/auth/login**
- Request body: `{ email, password, rememberMe }`
- Validation: Email format, password required
- Flow:
  1. Find user by email
  2. Verify password with bcrypt
  3. Check account status (reject if DELETED or SUSPENDED)
  4. Create session (28 days if rememberMe, browser-close otherwise)
  5. Update lastLoginAt timestamp
  6. Return session token as HttpOnly cookie
- Rate limit: 5 requests/15 minutes per IP
- Error codes: 401 (invalid credentials), 403 (account suspended/deleted), 500 (server error)

**POST /api/auth/logout**
- Authentication: Required
- Flow:
  1. Invalidate current session token
  2. Clear session cookie
  3. Return success
- Error codes: 401 (not authenticated), 500 (server error)

**POST /api/auth/logout-all**
- Authentication: Required
- Flow:
  1. Delete all sessions for current user
  2. Clear session cookie
  3. Return success
- Error codes: 401 (not authenticated), 500 (server error)

**POST /api/auth/forgot-password**
- Request body: `{ email }`
- Validation: Email format
- Flow:
  1. Find user by email (silent fail if not found for security)
  2. Generate password reset token (24-hour expiry)
  3. Send password reset email
  4. Return success (always, even if email not found)
- Rate limit: 3 requests/hour per email
- Error codes: 500 (server error)

**POST /api/auth/reset-password**
- Request body: `{ token, newPassword }`
- Validation: Token format, password strength
- Flow:
  1. Verify token validity and expiry
  2. Hash new password with bcrypt
  3. Update user password and passwordChangedAt
  4. Delete password reset token
  5. Invalidate all existing sessions
  6. Send password changed confirmation email
  7. Return success
- Error codes: 400 (invalid token/password), 404 (token not found), 410 (token expired), 500 (server error)

**GET /api/auth/verify-email?token=xxx**
- Query params: `token` (required)
- Flow:
  1. Verify token validity and expiry
  2. Update user: emailVerified = true, emailVerifiedAt = now()
  3. Delete verification token
  4. Redirect to dashboard with success message
- Error codes: 400 (invalid token), 404 (token not found), 410 (token expired), 500 (server error)

**POST /api/auth/resend-verification**
- Authentication: Required
- Flow:
  1. Check if email already verified (return early if yes)
  2. Delete existing verification tokens for user
  3. Generate new verification token (24-hour expiry)
  4. Send verification email
  5. Return success
- Rate limit: 3 requests/hour per user
- Error codes: 400 (already verified), 401 (not authenticated), 429 (rate limit), 500 (server error)

**GET /api/auth/[provider]** (Google, Facebook, Apple)
- Handled by NextAuth.js
- Flow: Redirect to OAuth provider

**GET /api/auth/callback/[provider]**
- Handled by NextAuth.js
- Flow:
  1. Receive OAuth data from provider
  2. Check if email exists in database
  3. If exists: Link provider account to existing user, login
  4. If new: Create user with SSO data (email, fullName, profilePicture), create account record
  5. If new user: Redirect to onboarding to collect birthdate
  6. If existing user: Redirect to dashboard

**POST /api/auth/delete-account**
- Authentication: Required
- Flow:
  1. Set user status to DELETED
  2. Set deletedAt timestamp
  3. Generate reactivation token (30-day expiry)
  4. Delete all sessions
  5. Send deletion confirmation email with reactivation link
  6. Clear session cookie
  7. Return success
- Error codes: 401 (not authenticated), 500 (server error)

**POST /api/auth/reactivate?token=xxx**
- Query params: `token` (required)
- Flow:
  1. Verify reactivation token
  2. Check if within 30-day window
  3. Update user: status = ACTIVE, deletedAt = null, reactivationToken = null
  4. Redirect to login with success message
- Error codes: 400 (invalid token), 404 (token not found), 410 (reactivation period expired), 500 (server error)

**Cleanup Job (Cron): /api/cron/cleanup-unverified**
- Schedule: Daily at 2 AM
- Flow:
  1. Find users where emailVerified = false AND createdAt < 30 days ago
  2. Send final warning email at 29 days
  3. Hard delete users at 30 days (and all related records)
  4. Log cleanup actions for audit

**Cleanup Job (Cron): /api/cron/cleanup-deleted**
- Schedule: Daily at 3 AM
- Flow:
  1. Find users where status = DELETED AND deletedAt < 30 days ago
  2. Hard delete users (and all related records)
  3. Log cleanup actions for GDPR compliance

### Frontend: UI Components and Interactions

**Pages:**
- `/auth/register` - Registration form
- `/auth/login` - Login form
- `/auth/forgot-password` - Forgot password form
- `/auth/reset-password?token=xxx` - Reset password form
- `/auth/verify-email?token=xxx` - Email verification handler (auto-redirect)
- `/auth/reactivate?token=xxx` - Account reactivation handler

**Components Architecture:**
```
/app/auth/
  layout.tsx          # Auth layout wrapper
  register/
    page.tsx          # Registration page
  login/
    page.tsx          # Login page
  forgot-password/
    page.tsx          # Forgot password page
  reset-password/
    page.tsx          # Reset password page
  verify-email/
    page.tsx          # Email verification handler
  reactivate/
    page.tsx          # Account reactivation handler

/components/auth/
  RegistrationForm.tsx
  LoginForm.tsx
  SSOButtons.tsx
  ForgotPasswordForm.tsx
  ResetPasswordForm.tsx
  FormInput.tsx
  FormButton.tsx

/components/notifications/
  EmailVerificationToaster.tsx

/lib/
  prisma.ts           # Prisma client
  auth.ts             # NextAuth config
  password.ts         # Password utilities
  email.ts            # SendGrid service
  tokens.ts           # Token generation
  rate-limit.ts       # Rate limiting
  validation.ts       # Zod schemas
```

**Form Validation (Zod Schemas):**
```typescript
// Registration
{
  email: string (valid format, required),
  password: string (min 8, 1 uppercase, 1 lowercase, 1 number),
  fullName: string (min 1),
  nickname: string (min 1),
  birthdate: date (not future, valid date),
  termsAccepted: boolean (must be true)
}

// Login
{
  email: string (valid format),
  password: string (min 1),
  rememberMe: boolean (optional, default false)
}

// Password Reset Request
{
  email: string (valid format)
}

// Password Reset
{
  token: string (required),
  newPassword: string (min 8, 1 uppercase, 1 lowercase, 1 number),
  confirmPassword: string (must match newPassword)
}
```

**Loading States:**
- Disable submit buttons during async operations
- Show spinner icon in button during submission
- Display inline loading text for clarity

**Error Handling:**
- Display field-specific errors below form inputs (red text)
- Display general errors in alert box above form
- Auto-focus first error field on validation failure

### Testing: Test Coverage Requirements

**Unit Tests:**
- Password hashing and verification (bcrypt utilities)
- Email format validation (Zod schemas)
- Token generation and verification
- Password strength validation
- Rate limiting logic

**Integration Tests:**
- Complete registration flow (email/password)
- Complete login flow (valid/invalid credentials)
- Password reset flow end-to-end
- Email verification flow
- Account soft delete and reactivation
- SSO registration flow (mock OAuth responses)
- Account linking (SSO to existing email)

**E2E Tests (Critical Paths Only):**
- User can register, verify email, and login
- User can reset password and login with new password
- User can register with Google and login again
- User can delete account and reactivate within 30 days

**Security Tests:**
- Rate limiting enforced on all auth endpoints
- Password complexity enforced
- Secure cookies set correctly (HttpOnly, Secure, SameSite)
- CSRF protection working
- Session hijacking prevented (token uniqueness)

## Reusable Components

### Existing Code to Leverage
**Already installed packages:**
- `react-hook-form` + `@hookform/resolvers` + `zod` - Form validation
- `next` v16 with App Router - Routing and API routes
- `typescript` - Type safety
- Tailwind CSS - Styling
- PWA configuration (`next-pwa`)

**Existing patterns:**
- App Router structure (`/app`)
- Hungarian language default (`lang="hu"`)
- TypeScript configuration
- Tailwind styling approach

### New Components Required
All authentication components are new since no auth system exists yet:
- All UI form components
- All backend services and utilities
- All Prisma models
- All API routes
- All email templates

**Why new code is needed:**
- No existing authentication system in project
- No existing Prisma schema or database models
- No existing form components or validation patterns
- No existing email service integration

## Out of Scope

**Future features NOT included in this spec:**
- Parental consent workflow (UI and email collection flow)
- Secondary email/phone for account recovery (UI implementation)
- Email change functionality
- Two-factor authentication (2FA)
- Magic link authentication (passwordless)
- Account linking UI (link/unlink SSO providers in profile)
- Admin panel for user management
- User impersonation (admin feature)
- Audit logging of all auth events
- Export user data (GDPR data portability)
- Multi-language support (structure prepared, translations not included)

**Future database fields included but not used:**
- `secondaryEmail` - For account recovery
- `phoneNumber` - For account recovery
- `COACH` and `PARENT` user roles - Prepared for future use
- Parental consent fields - Prepared but no workflow yet

## Success Criteria

**Functional Requirements:**
- Users can register with email/password with all required fields
- Users can register/login with Google, Facebook, and Apple
- Users can login with email/password
- Users can request password reset via email
- Users can reset password using email link
- Email verification link sent immediately after registration
- Email verification link expires after 24 hours
- Password reset link expires after 24 hours
- Unverified users see toaster reminder until email verified
- Users can resend verification email (max 3 times/hour)
- Unverified accounts deleted after 30 days with reminders sent
- Sessions last 28 days (or browser close without "remember me")
- Users can logout from current device
- Users can logout from all devices
- SSO accounts automatically link to existing email accounts
- All transactional emails delivered successfully
- Account soft delete with 30-day reactivation period
- Reactivation link works within 30-day window

**Security Requirements:**
- Passwords hashed with bcrypt (cost factor 12)
- Rate limiting enforced: 5 login attempts/15min, 3 reset requests/hour, 5 registrations/hour
- CSRF protection on all forms (NextAuth.js)
- Secure, HttpOnly, SameSite=Lax cookies for sessions
- SSO tokens encrypted in database
- Email uniqueness enforced (no duplicate accounts)
- All sessions invalidated after password change
- Tokens stored as hashed values in database

**UX Requirements:**
- Clear, helpful error messages in Hungarian
- Loading states on all async operations
- Responsive design works on mobile (320px+), tablet, desktop
- Accessible forms meet WCAG 2.1 AA standards
- Email verification toaster non-intrusive but visible
- Forms use client-side validation for immediate feedback
- Server-side validation prevents invalid submissions

**Performance Requirements:**
- Login response time under 500ms
- Registration response time under 1 second
- Email delivery within 1 minute
- Password reset process under 2 minutes end-to-end
- Database queries optimized with indexes on email, sessionToken, token fields

**GDPR Compliance:**
- Parental consent flags tracked in database
- User birthdate stored for age verification
- Account deletion is soft delete (30-day reactivation)
- Hard delete after 30 days with audit trail
- All user data deleted on hard delete (cascade)

## Security Considerations

**Password Security:**
- Bcrypt hashing with cost factor 12
- Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
- No password stored in plain text anywhere
- Password reset requires valid email verification
- All sessions invalidated after password change

**Token Security:**
- All tokens stored as hashed values in database
- 24-hour expiry for verification and reset tokens
- 30-day expiry for reactivation tokens
- Tokens are single-use (deleted after use)
- Tokens are cryptographically random (UUIDs)

**Session Security:**
- Session tokens stored as HttpOnly cookies (prevent XSS)
- Secure flag enabled (HTTPS only)
- SameSite=Lax (prevent CSRF)
- Session tokens are UUIDs stored hashed in database
- Support multiple concurrent sessions (different devices)
- "Logout all devices" invalidates all session tokens

**Rate Limiting:**
- Login: 5 attempts per 15 minutes per IP
- Password reset: 3 requests per hour per email
- Email verification resend: 3 requests per hour per user
- Registration: 5 registrations per hour per IP
- Implement exponential backoff on repeated failures

**Data Protection:**
- Email addresses stored in lowercase for consistency
- SSO access/refresh tokens encrypted before storage
- User deletion is soft delete with 30-day grace period
- Hard delete removes all related data (cascade)
- No sensitive data logged in application logs

**CSRF Protection:**
- All forms include CSRF tokens
- NextAuth.js handles CSRF protection automatically
- API routes validate CSRF tokens on POST/PUT/DELETE

**Input Validation:**
- Server-side validation on all inputs (never trust client)
- Client-side validation for UX (Zod schemas)
- Sanitize all user inputs to prevent injection
- Allowlist approach for email format validation
- Strict type checking with TypeScript

## Validation Rules

**Email Validation:**
- Required field
- Valid email format (RFC 5322)
- Maximum 255 characters
- Unique in database
- Stored in lowercase
- Hungarian error: "Kérlek, adj meg egy érvényes email címet"
- Duplicate error: "Ez az email cím már regisztrálva van"

**Password Validation:**
- Required field
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- No maximum length restriction
- Hungarian error: "A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűt, valamint számot"

**Full Name Validation:**
- Required field
- Minimum 1 character (after trim)
- Maximum 255 characters
- Hungarian error: "A teljes név megadása kötelező"

**Nickname Validation:**
- Required field
- Minimum 1 character (after trim)
- Maximum 100 characters
- Can be same as first name
- Hungarian error: "A becenév megadása kötelező"

**Birthdate Validation:**
- Required field
- Valid date format (YYYY-MM-DD)
- Cannot be future date
- No minimum age enforced (tracking only)
- Hungarian error: "Kérlek, add meg a születési dátumodat"
- Future date error: "A születési dátum nem lehet jövőbeli"

**Terms Acceptance Validation:**
- Required field
- Must be true to proceed
- Hungarian error: "Az Általános Szerződési Feltételek elfogadása kötelező"

## Error Handling

**User-Facing Error Messages (Hungarian):**
- Invalid email format: "Kérlek, adj meg egy érvényes email címet"
- Email already exists: "Ez az email cím már regisztrálva van"
- Weak password: "A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűt, valamint számot"
- Invalid credentials: "Hibás email vagy jelszó"
- Expired token: "Ez a link lejárt. Kérj új jelszó visszaállítási linket"
- Account not found: "Nincs ilyen fiók"
- Account deleted: "Ez a fiók törölve lett"
- Account suspended: "Ez a fiók felfüggesztésre került"
- Rate limit exceeded: "Túl sok próbálkozás. Kérlek, próbáld újra később"
- Server error: "Hiba történt. Kérlek, próbáld újra később"

**Success Messages (Hungarian):**
- Registration success: "Sikeres regisztráció! Küldtünk egy megerősítő emailt"
- Email verified: "Email cím sikeresen megerősítve!"
- Password reset sent: "Jelszó visszaállítási linket küldtünk az email címedre"
- Password changed: "Jelszó sikeresen megváltoztatva"
- Logged in: "Sikeres bejelentkezés!"
- Logged out: "Sikeres kijelentkezés"
- Account deleted: "Fiók törölve. 30 napon belül visszaállítható"
- Account reactivated: "Fiók sikeresen visszaállítva"

**HTTP Status Codes:**
- 200 OK: Successful operation
- 201 Created: User created successfully
- 400 Bad Request: Validation error
- 401 Unauthorized: Invalid credentials or not authenticated
- 403 Forbidden: Account suspended or deleted
- 404 Not Found: Resource not found (user, token)
- 409 Conflict: Email already exists
- 410 Gone: Token expired
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Kérlek, adj meg egy érvényes email címet",
    "field": "email"
  }
}
```

**Centralized Error Handling:**
- API routes use try-catch blocks
- Errors logged to console (development) and monitoring service (production)
- Never expose stack traces or internal errors to users
- Generic error message for unexpected errors
- Specific error codes for different failure types

**Graceful Degradation:**
- If SendGrid fails, queue email for retry (don't block registration)
- If session creation fails, allow user to retry login
- If SSO provider is down, show clear error and suggest email/password option
- Implement exponential backoff for transient failures

## Email Template Specifications

**Email Service: SendGrid**
- Use SendGrid Dynamic Templates
- Templates stored in SendGrid dashboard
- Variables passed via API
- Track email opens and clicks (optional)

**Template Structure:**
- Header: tinicoach logo (when available)
- Body: Personalized content with clear CTA
- Footer: Legal links (Terms, Privacy), unsubscribe, copyright
- Responsive design (mobile-friendly)
- Plain text fallback for all emails

**Template Variables (All Emails):**
- `userName` - User's full name or nickname
- `userEmail` - User's email address
- `actionLink` - Verification/reset/reactivation link
- `expiryTime` - Link expiration time (e.g., "24 óra")
- `supportEmail` - Platform support email (e.g., support@tinicoach.hu)
- `currentYear` - For copyright footer

**1. Welcome Email (After Registration)**
- Subject: "Üdvözlünk a tinicoach-nál! 🎉"
- Greeting: "Szia {{userName}}!"
- Content:
  - Welcome message
  - Brief overview of platform features
  - Email verification CTA button
  - Link expiry notice (24 hours)
- CTA Button: "Email cím megerősítése"
- Footer: Standard footer with legal links

**2. Email Verification**
- Subject: "Erősítsd meg az email címed"
- Greeting: "Szia {{userName}}!"
- Content:
  - Instruction to verify email
  - Importance of verification
  - Link expiry notice (24 hours)
  - What to do if didn't request (ignore email)
- CTA Button: "Email cím megerősítése"
- Footer: Standard footer

**3. Password Reset**
- Subject: "Jelszó visszaállítás"
- Greeting: "Szia {{userName}}!"
- Content:
  - Confirmation that reset was requested
  - Link expiry notice (24 hours)
  - Security notice: don't share link
  - What to do if didn't request (contact support)
- CTA Button: "Jelszó visszaállítása"
- Footer: Standard footer + support link

**4. Password Changed Confirmation**
- Subject: "Jelszavad megváltozott"
- Greeting: "Szia {{userName}}!"
- Content:
  - Confirmation that password was changed
  - Timestamp of change
  - What to do if suspicious (contact support immediately)
  - Security tip: use strong passwords
- No CTA (informational only)
- Footer: Standard footer + prominent support link

**5. Account Deletion Confirmation**
- Subject: "Fiókod törölve lett"
- Greeting: "Szia {{userName}}!"
- Content:
  - Confirmation of account deletion
  - Reactivation window (30 days)
  - Data deletion timeline
  - What data is kept (audit logs)
- CTA Button: "Fiók visszaállítása"
- Footer: Standard footer

**6. Unverified Account Reminders**
- Day 7: "Ne felejtsd el megerősíteni az email címed"
- Day 14: "Még mindig nem erősítetted meg az email címed"
- Day 28: "Utolsó figyelmeztetés: erősítsd meg az email címed"
- Day 29: "A fiókod holnap törlésre kerül"
- Content: Reminder about verification, consequences of not verifying, CTA to verify

**7. Parental Consent Request (Future - Template Only)**
- Subject: "Szülői hozzájárulás szükséges"
- Recipient: Parent email (provided by teen)
- Content:
  - Explanation of platform
  - Data usage transparency
  - Consent request with link
- CTA Button: "Hozzájárulás megadása"
- Footer: Standard footer + privacy policy link

**Plain Text Fallback:**
All emails must have plain text version with:
- Clear structure
- Links as full URLs
- No images or formatting
- All essential information preserved

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://tinicoach.hu"
NEXTAUTH_SECRET="generate-random-secret-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Facebook OAuth
FACEBOOK_CLIENT_ID="xxx"
FACEBOOK_CLIENT_SECRET="xxx"

# Apple OAuth
APPLE_CLIENT_ID="xxx"
APPLE_CLIENT_SECRET="xxx"

# SendGrid
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@tinicoach.hu"
SENDGRID_FROM_NAME="tinicoach"

# Support Email
SUPPORT_EMAIL="support@tinicoach.hu"

# Rate Limiting (optional overrides)
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW=900  # 15 minutes in seconds
RATE_LIMIT_RESET_ATTEMPTS=3
RATE_LIMIT_RESET_WINDOW=3600  # 1 hour in seconds
```

## Dependencies and Integration

**External Services Required:**
- SendGrid account with verified sender domain
- Google OAuth 2.0 credentials (Google Cloud Console)
- Facebook App with Facebook Login configured
- Apple Developer account with Sign In with Apple enabled
- PostgreSQL database (Vercel Postgres or Supabase recommended)

**OAuth Setup Steps:**
- Google: Create OAuth 2.0 Client ID, configure redirect URI
- Facebook: Create Facebook App, enable Facebook Login, configure OAuth redirect
- Apple: Configure Sign In with Apple, generate client secret (JWT)

**Database Setup:**
- PostgreSQL instance provisioned
- Prisma migrations configured and run
- Connection pooling enabled (recommended)
- SSL mode enabled for production

**Environment Requirements:**
- HTTPS enabled (required for secure cookies and OAuth)
- Domain configured for OAuth redirects (exact match required)
- Email domain verified in SendGrid (SPF, DKIM records)

**Package Dependencies:**
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.22",
    "bcryptjs": "^2.4.3",
    "@prisma/client": "^5.7.0",
    "@sendgrid/mail": "^8.1.0",
    "zod": "^4.1.12",
    "react-hook-form": "^7.66.0",
    "@hookform/resolvers": "^5.2.2"
  },
  "devDependencies": {
    "prisma": "^5.7.0",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Alignment with User Standards

**Tech Stack Compliance:**
- Next.js 14+ with App Router (confirmed in requirements)
- TypeScript for type safety (confirmed in package.json)
- PostgreSQL with Prisma ORM (confirmed in requirements)
- NextAuth.js v5 for authentication (confirmed in requirements)
- SendGrid for email (confirmed in requirements)
- Tailwind CSS for styling (confirmed in existing setup)

**Database Model Best Practices:**
- Singular model names (User, Account, Session)
- Timestamps on all tables (createdAt, updatedAt)
- Database constraints (NOT NULL, UNIQUE, foreign keys)
- Appropriate data types (UUID for IDs, DateTime for timestamps)
- Indexes on foreign keys and frequently queried fields
- Clear relationship definitions with cascade behaviors

**API Endpoint Standards:**
- RESTful design with resource-based URLs
- Consistent naming (lowercase, hyphenated)
- Appropriate HTTP methods (GET, POST, PUT, DELETE)
- Consistent HTTP status codes (200, 201, 400, 401, 404, 500)
- Rate limiting headers in responses

**Error Handling Best Practices:**
- User-friendly Hungarian error messages
- No technical details or stack traces exposed
- Centralized error handling in API routes
- Specific exception types for targeted handling
- Graceful degradation for non-critical failures
- Retry strategies for transient failures (email sending)

**Validation Best Practices:**
- Server-side validation always (never trust client)
- Client-side validation for UX (react-hook-form + Zod)
- Fail early with clear error messages
- Field-specific error messages
- Allowlist approach for email validation
- Type and format validation at multiple layers

**UI Component Best Practices:**
- Single responsibility (one component, one purpose)
- Reusable with configurable props
- Clear prop interfaces with TypeScript
- Minimal props to reduce complexity
- State kept local unless needed globally
- Consistent naming conventions

**Testing Best Practices:**
- Focus on core user flows (registration, login, reset)
- Test behavior, not implementation
- Mock external dependencies (SendGrid, OAuth)
- Fast unit tests for utilities
- Integration tests for critical paths
- E2E tests for complete user journeys

## Questions/Clarifications

**Answered by Requirements:**
1. Unverified account deletion: 30 days (confirmed)
2. Email service: SendGrid (confirmed)
3. Tech stack: Next.js 14+, NextAuth.js v5, PostgreSQL, Prisma (confirmed)
4. Language: Hungarian primary, prepare for multi-language (confirmed)

**Still Need Clarification:**
1. Admin role creation: How are admin accounts created? (Seed data or special registration flow?)
2. Profile picture storage: Where to store uploaded profile pictures? (S3, Cloudinary, local filesystem?)
3. Gender field options: What options for gender enum? (Suggested: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)
4. Subscription integration: Should User model include subscription status fields, or separate Subscription table? (Existing docs suggest separate table)
5. SendGrid templates: Use SendGrid dynamic templates (managed in dashboard) or custom HTML in codebase? (Recommended: SendGrid dynamic templates)
6. SSO profile pictures: Store URL from provider or download and host locally? (Recommended: Store URL initially, migrate to local storage later)
7. Support email address: Confirm support@tinicoach.hu is correct
8. Branding assets: Logo and color scheme for email templates (create basic template without branding for now)
