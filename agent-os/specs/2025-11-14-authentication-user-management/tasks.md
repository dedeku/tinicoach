# Task Breakdown: Authentication & User Management

## Overview
Total Task Groups: 11
Estimated Timeline: 3-4 weeks
Core Technologies: Next.js 14, NextAuth.js v5, Prisma, PostgreSQL, SendGrid

## Task List

### Phase 1: Foundation & Database

#### Task Group 1: Database Schema & Migrations
**Assigned specialist:** Database Engineer
**Dependencies:** None
**Effort:** L

- [ ] 1.0 Complete database schema setup
  - [ ] 1.1 Write 2-8 focused tests for Prisma models
    - Test User model creation and validation
    - Test unique email constraint
    - Test relationships (User → Account, User → Session, User → VerificationToken)
    - Test soft delete behavior (status = DELETED)
  - [ ] 1.2 Create Prisma schema file with all models
    - User model with all fields (id, email, password, emailVerified, profile fields, metadata, account status)
    - Account model for SSO providers (Google, Facebook, Apple)
    - Session model for session management
    - VerificationToken model for email verification and password reset
    - Define all enums (UserRole, Gender, AccountStatus, SSOProvider, TokenType)
    - Follow pattern from: spec.md lines 100-225
  - [ ] 1.3 Create initial migration for all auth tables
    - Add indexes on: email, sessionToken, token, reactivationToken, userId
    - Add foreign key constraints with CASCADE delete
    - Configure UUID as default ID strategy
  - [ ] 1.4 Set up Prisma client singleton
    - Create lib/prisma.ts with client instance
    - Handle connection pooling
    - Configure for development vs production
  - [ ] 1.5 Create seed data for testing
    - Admin user account
    - Test user accounts with various states
  - [ ] 1.6 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify migrations run successfully
    - Verify relationships work correctly

**Acceptance Criteria:**
- All Prisma models defined with proper types and relationships
- Migrations run successfully without errors
- Database indexes created on all frequently-queried fields
- Seed data loads correctly
- The 2-8 tests written in 1.1 pass

---

#### Task Group 2: Core Authentication Utilities
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Group 1
**Effort:** M

- [ ] 2.0 Complete authentication utility functions
  - [ ] 2.1 Write 2-8 focused tests for utilities
    - Test password hashing and verification (bcrypt)
    - Test token generation (UUIDs, cryptographic randomness)
    - Test token expiry validation
    - Test email normalization (lowercase conversion)
  - [ ] 2.2 Create password utility (lib/password.ts)
    - hashPassword function using bcrypt (cost factor 12)
    - verifyPassword function for authentication
    - validatePasswordStrength function (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  - [ ] 2.3 Create token utility (lib/tokens.ts)
    - generateToken function (UUID v4)
    - hashToken function for database storage
    - verifyToken function with expiry check
    - calculateExpiry helper (24h for verification/reset, 30d for reactivation)
  - [ ] 2.4 Create validation schemas (lib/validation.ts)
    - registrationSchema (email, password, fullName, nickname, birthdate, termsAccepted)
    - loginSchema (email, password, rememberMe)
    - passwordResetRequestSchema (email)
    - passwordResetSchema (token, newPassword, confirmPassword)
    - Use Zod for all schemas with Hungarian error messages
  - [ ] 2.5 Create rate limiting middleware (lib/rate-limit.ts)
    - Implement rate limiter with IP-based tracking
    - Configure limits: 5 login/15min, 3 reset/hour, 5 registration/hour
    - Return 429 status with retry-after header
  - [ ] 2.6 Ensure utility tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify password hashing works correctly
    - Verify token generation is secure

**Acceptance Criteria:**
- Password hashing uses bcrypt with cost factor 12
- Token generation uses cryptographically secure random values
- Validation schemas enforce all requirements from spec
- Rate limiting prevents abuse on auth endpoints
- The 2-8 tests written in 2.1 pass

---

### Phase 2: Email & Transactional Communications

#### Task Group 3: Email Service Integration
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Group 2
**Effort:** L

- [ ] 3.0 Complete email service integration
  - [ ] 3.1 Write 2-8 focused tests for email service
    - Test email sending function (mock SendGrid API)
    - Test template variable substitution
    - Test email queuing for retries on failure
    - Test error handling for SendGrid failures
  - [ ] 3.2 Install and configure SendGrid
    - Install @sendgrid/mail package
    - Configure API key from environment variables
    - Set up sender domain verification (SENDGRID_FROM_EMAIL)
  - [ ] 3.3 Create email service (lib/email.ts)
    - sendEmail function with SendGrid API
    - Email queue for retry logic on transient failures
    - Template rendering with variable substitution
    - Plain text fallback generation
    - Error handling with graceful degradation
  - [ ] 3.4 Create email template types
    - TypeScript interfaces for all template variables
    - Template IDs enum for SendGrid templates
    - Template data builders for each email type
  - [ ] 3.5 Ensure email service tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify mock email sending works
    - Verify error handling prevents blocking operations

**Acceptance Criteria:**
- SendGrid API integration works correctly
- Email service handles failures gracefully without blocking
- All email types have defined templates
- Template variables properly substituted
- The 2-8 tests written in 3.1 pass

---

#### Task Group 4: SendGrid Email Templates
**Assigned specialist:** Frontend Engineer / Email Designer
**Dependencies:** Task Group 3
**Effort:** L

- [ ] 4.0 Complete SendGrid email templates (Hungarian)
  - [ ] 4.1 Create welcome email template
    - Subject: "Üdvözlünk a tinicoach-nál! 🎉"
    - Content: Welcome message, platform overview, email verification CTA
    - Variables: userName, actionLink, expiryTime (24 hours)
    - Follow template structure from spec.md lines 772-781
  - [ ] 4.2 Create email verification template
    - Subject: "Erősítsd meg az email címed"
    - Content: Verification instructions, expiry notice, security note
    - Variables: userName, actionLink, expiryTime
    - Follow template structure from spec.md lines 783-793
  - [ ] 4.3 Create password reset template
    - Subject: "Jelszó visszaállítás"
    - Content: Reset confirmation, security warning, expiry notice
    - Variables: userName, actionLink, expiryTime, supportEmail
    - Follow template structure from spec.md lines 795-804
  - [ ] 4.4 Create password changed confirmation template
    - Subject: "Jelszavad megváltozott"
    - Content: Change confirmation, timestamp, security advice
    - Variables: userName, changeTimestamp, supportEmail
    - Follow template structure from spec.md lines 806-815
  - [ ] 4.5 Create account deletion confirmation template
    - Subject: "Fiókod törölve lett"
    - Content: Deletion confirmation, reactivation window (30 days), data timeline
    - Variables: userName, actionLink (reactivation), expiryTime (30 days)
    - Follow template structure from spec.md lines 817-825
  - [ ] 4.6 Create unverified account reminder templates
    - Day 7: "Ne felejtsd el megerősíteni az email címed"
    - Day 14: "Még mindig nem erősítetted meg az email címed"
    - Day 28: "Utolsó figyelmeztetés: erősítsd meg az email címed"
    - Day 29: "A fiókod holnap törlésre kerül"
    - Variables: userName, actionLink, daysRemaining
    - Follow template structure from spec.md lines 827-832
  - [ ] 4.7 Create parental consent template (future - template only)
    - Subject: "Szülői hozzájárulás szükséges"
    - Content: Platform explanation, data usage, consent link
    - Variables: teenName, parentEmail, actionLink
    - Follow template structure from spec.md lines 834-842
  - [ ] 4.8 Test all templates in SendGrid dashboard
    - Verify rendering on mobile and desktop
    - Verify plain text fallback versions
    - Test all variable substitutions
    - Check links and CTAs work correctly

**Acceptance Criteria:**
- All 7 email templates created in SendGrid dashboard
- All templates render correctly on mobile and desktop
- All templates have plain text fallbacks
- All variable substitutions work correctly
- Hungarian language used throughout all templates

---

### Phase 3: Authentication API & Backend Logic

#### Task Group 5: NextAuth.js Configuration
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 1, 2
**Effort:** L

- [ ] 5.0 Complete NextAuth.js setup
  - [ ] 5.1 Write 2-8 focused tests for NextAuth config
    - Test session creation and validation
    - Test JWT token structure
    - Test session expiry (28 days default)
    - Test "remember me" behavior
  - [ ] 5.2 Install NextAuth.js v5 and dependencies
    - Install next-auth@^5.0.0-beta.22
    - Install @auth/prisma-adapter
    - Configure TypeScript types for NextAuth
  - [ ] 5.3 Create NextAuth configuration (lib/auth.ts)
    - Configure Prisma adapter
    - Set up session strategy (JWT vs database sessions)
    - Configure session duration (28 days or browser-close)
    - Set up CSRF protection
    - Configure secure cookie settings (HttpOnly, Secure, SameSite=Lax)
  - [ ] 5.4 Create NextAuth API route handler
    - Create app/api/auth/[...nextauth]/route.ts
    - Export GET and POST handlers
    - Configure callbacks (signIn, session, jwt)
  - [ ] 5.5 Configure environment variables
    - NEXTAUTH_URL
    - NEXTAUTH_SECRET (min 32 chars)
    - Verify all required env vars from spec.md lines 852-886
  - [ ] 5.6 Ensure NextAuth tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify session creation works
    - Verify cookie security settings applied

**Acceptance Criteria:**
- NextAuth.js v5 installed and configured
- Session management works with 28-day default expiry
- Secure cookies configured correctly (HttpOnly, Secure, SameSite)
- CSRF protection enabled
- The 2-8 tests written in 5.1 pass

---

#### Task Group 6: Registration & Login API Endpoints
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 2, 3, 5
**Effort:** XL

- [ ] 6.0 Complete registration and login endpoints
  - [ ] 6.1 Write 2-8 focused tests for registration/login
    - Test successful registration flow
    - Test duplicate email rejection (409)
    - Test successful login with valid credentials
    - Test failed login with invalid credentials (401)
    - Test rate limiting enforcement (429)
  - [ ] 6.2 Create registration endpoint (POST /api/auth/register)
    - Validate request body with registrationSchema
    - Check email uniqueness in database
    - Hash password with bcrypt (cost 12)
    - Create user record (status: ACTIVE, emailVerified: false)
    - Generate email verification token (24-hour expiry)
    - Store hashed token in VerificationToken table
    - Send welcome email with verification link
    - Apply rate limiting (5 registrations/hour per IP)
    - Return 201 with user ID (do not auto-login)
    - Follow spec.md lines 229-240
  - [ ] 6.3 Create login endpoint (POST /api/auth/login)
    - Validate request body with loginSchema
    - Find user by email (case-insensitive)
    - Verify password with bcrypt
    - Check account status (reject if DELETED or SUSPENDED)
    - Create session (28 days if rememberMe, browser-close otherwise)
    - Update lastLoginAt timestamp
    - Return session token as HttpOnly cookie
    - Apply rate limiting (5 attempts/15 minutes per IP)
    - Follow spec.md lines 242-253
  - [ ] 6.4 Create logout endpoint (POST /api/auth/logout)
    - Require authentication (verify session token)
    - Invalidate current session token in database
    - Clear session cookie
    - Return 200 success
    - Follow spec.md lines 255-261
  - [ ] 6.5 Create logout-all endpoint (POST /api/auth/logout-all)
    - Require authentication
    - Delete all sessions for current user from database
    - Clear session cookie
    - Return 200 success
    - Follow spec.md lines 263-269
  - [ ] 6.6 Ensure registration/login tests pass
    - Run ONLY the 2-8 tests written in 6.1
    - Verify core registration and login flows work
    - Verify rate limiting prevents abuse

**Acceptance Criteria:**
- Registration creates user with hashed password
- Email verification token generated and email sent
- Login validates credentials and creates session
- Rate limiting enforced on all endpoints
- Account status checked before allowing login
- The 2-8 tests written in 6.1 pass

---

#### Task Group 7: Password Reset API Endpoints
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 2, 3, 5
**Effort:** M

- [ ] 7.0 Complete password reset functionality
  - [ ] 7.1 Write 2-8 focused tests for password reset
    - Test password reset request (always returns 200)
    - Test password reset with valid token
    - Test password reset with expired token (410)
    - Test password reset with invalid token (404)
    - Test all sessions invalidated after reset
  - [ ] 7.2 Create forgot-password endpoint (POST /api/auth/forgot-password)
    - Validate request body (email only)
    - Find user by email (silent fail if not found)
    - Generate password reset token (24-hour expiry)
    - Store hashed token in VerificationToken table
    - Send password reset email
    - Always return 200 success (even if email not found)
    - Apply rate limiting (3 requests/hour per email)
    - Follow spec.md lines 271-280
  - [ ] 7.3 Create reset-password endpoint (POST /api/auth/reset-password)
    - Validate request body (token, newPassword, confirmPassword)
    - Verify token validity and expiry
    - Find user by token
    - Hash new password with bcrypt (cost 12)
    - Update user password and passwordChangedAt
    - Delete password reset token
    - Invalidate all existing sessions for user
    - Send password changed confirmation email
    - Return 200 success
    - Follow spec.md lines 282-293
  - [ ] 7.4 Ensure password reset tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify reset flow works end-to-end
    - Verify sessions invalidated after password change

**Acceptance Criteria:**
- Password reset request always returns success (no email enumeration)
- Reset token has 24-hour expiry
- Password updated successfully with valid token
- All sessions invalidated after password change
- Confirmation email sent after successful reset
- The 2-8 tests written in 7.1 pass

---

#### Task Group 8: Email Verification & Account Management
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 2, 3, 5
**Effort:** L

- [ ] 8.0 Complete email verification and account management
  - [ ] 8.1 Write 2-8 focused tests for verification/management
    - Test email verification with valid token
    - Test email verification with expired token (410)
    - Test resend verification (max 3/hour)
    - Test account soft delete
    - Test account reactivation within 30 days
  - [ ] 8.2 Create verify-email endpoint (GET /api/auth/verify-email)
    - Accept token as query parameter
    - Verify token validity and expiry
    - Find user by token
    - Update user: emailVerified = true, emailVerifiedAt = now()
    - Delete verification token
    - Redirect to dashboard with success message
    - Follow spec.md lines 295-302
  - [ ] 8.3 Create resend-verification endpoint (POST /api/auth/resend-verification)
    - Require authentication
    - Check if email already verified (return early if yes)
    - Delete existing verification tokens for user
    - Generate new verification token (24-hour expiry)
    - Send verification email
    - Apply rate limiting (3 requests/hour per user)
    - Return 200 success
    - Follow spec.md lines 304-313
  - [ ] 8.4 Create delete-account endpoint (POST /api/auth/delete-account)
    - Require authentication
    - Set user status to DELETED
    - Set deletedAt timestamp
    - Generate reactivation token (30-day expiry)
    - Delete all sessions for user
    - Send deletion confirmation email with reactivation link
    - Clear session cookie
    - Return 200 success
    - Follow spec.md lines 329-339
  - [ ] 8.5 Create reactivate endpoint (POST /api/auth/reactivate)
    - Accept token as query parameter
    - Verify reactivation token
    - Check if within 30-day window
    - Update user: status = ACTIVE, deletedAt = null, reactivationToken = null
    - Redirect to login with success message
    - Follow spec.md lines 341-348
  - [ ] 8.6 Ensure verification/management tests pass
    - Run ONLY the 2-8 tests written in 8.1
    - Verify email verification flow works
    - Verify account deletion and reactivation work

**Acceptance Criteria:**
- Email verification updates user record correctly
- Resend verification rate limited to prevent abuse
- Account soft delete preserves data for 30 days
- Reactivation link works within 30-day window
- All related sessions deleted on account deletion
- The 2-8 tests written in 8.1 pass

---

#### Task Group 9: Social Authentication (SSO) Integration
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 5, 6
**Effort:** XL

- [ ] 9.0 Complete SSO integration for Google, Facebook, Apple
  - [ ] 9.1 Write 2-8 focused tests for SSO
    - Test SSO registration creates new user
    - Test SSO login links to existing account (matching email)
    - Test SSO data extraction (email, fullName, profilePicture)
    - Test account linking prevents duplicates
  - [ ] 9.2 Configure Google OAuth 2.0
    - Create OAuth client in Google Cloud Console
    - Configure authorized redirect URIs
    - Add Google provider to NextAuth config
    - Store GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
    - Follow spec.md lines 861-863
  - [ ] 9.3 Configure Facebook Login
    - Create Facebook App
    - Enable Facebook Login product
    - Configure OAuth redirect URI
    - Add Facebook provider to NextAuth config
    - Store FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET in .env
    - Follow spec.md lines 865-867
  - [ ] 9.4 Configure Apple Sign In
    - Set up Apple Developer account
    - Enable Sign In with Apple
    - Generate client secret (JWT)
    - Add Apple provider to NextAuth config
    - Store APPLE_CLIENT_ID and APPLE_CLIENT_SECRET in .env
    - Follow spec.md lines 869-871
  - [ ] 9.5 Implement SSO callback logic
    - Check if email exists in database
    - If exists: Link SSO provider to existing user, login
    - If new: Create user with SSO data (email, fullName, profilePicture)
    - Create Account record for provider
    - If new user: Redirect to onboarding for birthdate collection
    - If existing user: Redirect to dashboard
    - Follow spec.md lines 320-327
  - [ ] 9.6 Implement account linking
    - Allow users to link multiple SSO providers to same account
    - Prevent duplicate accounts with same email
    - Store SSO tokens encrypted in database
    - Handle provider email changes gracefully
  - [ ] 9.7 Ensure SSO tests pass
    - Run ONLY the 2-8 tests written in 9.1
    - Verify SSO registration creates accounts correctly
    - Verify account linking works for existing users

**Acceptance Criteria:**
- Google, Facebook, and Apple OAuth configured
- SSO registration creates user with provider data
- SSO login links to existing account if email matches
- Multiple SSO providers can link to same account
- SSO tokens encrypted before database storage
- The 2-8 tests written in 9.1 pass

---

### Phase 4: Frontend UI Components

#### Task Group 10: Authentication UI Components
**Assigned specialist:** Frontend Engineer
**Dependencies:** Task Groups 6, 7, 8
**Effort:** XL

- [ ] 10.0 Complete authentication UI components
  - [ ] 10.1 Write 2-8 focused tests for UI components
    - Test form submission and validation
    - Test error message display
    - Test loading states during async operations
    - Test SSO button redirects
  - [ ] 10.2 Create reusable form components
    - FormInput component (text, email, password, date inputs)
      - Props: name, label, type, error, required
      - Display field-specific error messages below input
      - Auto-focus first error on validation failure
    - FormButton component
      - Props: loading, disabled, children
      - Show spinner during loading state
      - Disable button when loading or disabled
    - AuthLayout component
      - Centered form layout
      - Responsive breakpoints (mobile-first 320px+, tablet 768px+, desktop 1024px+)
  - [ ] 10.3 Create RegistrationForm component
    - Fields: email, password, fullName, nickname, birthdate, termsAccepted
    - Use react-hook-form with Zod validation (registrationSchema)
    - Client-side validation with immediate feedback
    - Hungarian error messages
    - Submit to POST /api/auth/register
    - Show success message on registration
    - Follow spec.md lines 415-424
  - [ ] 10.4 Create LoginForm component
    - Fields: email, password, rememberMe checkbox
    - Use react-hook-form with Zod validation (loginSchema)
    - Client-side validation with immediate feedback
    - Hungarian error messages
    - Submit to POST /api/auth/login
    - Redirect to dashboard on success
    - "Forgot password?" link
    - Follow spec.md lines 425-431
  - [ ] 10.5 Create SSOButtons component
    - Buttons for Google, Facebook, Apple
    - Redirect to /api/auth/signin/[provider]
    - Show loading state during redirect
    - Clear branding for each provider
    - Responsive design
  - [ ] 10.6 Create ForgotPasswordForm component
    - Field: email
    - Use react-hook-form with Zod validation
    - Submit to POST /api/auth/forgot-password
    - Show success message (always)
    - Follow spec.md lines 432-435
  - [ ] 10.7 Create ResetPasswordForm component
    - Fields: newPassword, confirmPassword
    - Token from URL query parameter
    - Use react-hook-form with Zod validation
    - Password strength indicator
    - Submit to POST /api/auth/reset-password
    - Redirect to login on success
    - Follow spec.md lines 436-443
  - [ ] 10.8 Create EmailVerificationToaster component
    - Persistent notification for unverified users
    - Dismissible but reappears on page reload
    - Include "Resend verification email" link
    - Non-intrusive design (corner of screen)
    - Only show if user logged in and email not verified
  - [ ] 10.9 Create authentication pages
    - /app/auth/register/page.tsx - Registration page
    - /app/auth/login/page.tsx - Login page
    - /app/auth/forgot-password/page.tsx - Forgot password page
    - /app/auth/reset-password/page.tsx - Reset password page
    - /app/auth/verify-email/page.tsx - Email verification handler (auto-redirect)
    - /app/auth/reactivate/page.tsx - Account reactivation handler
    - All pages use AuthLayout wrapper
    - Follow spec.md lines 367-390
  - [ ] 10.10 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 10.1
    - Verify forms submit correctly
    - Verify error messages display properly

**Acceptance Criteria:**
- All form components use react-hook-form + Zod validation
- Client-side validation provides immediate feedback
- All error messages in Hungarian
- Loading states show during async operations
- Responsive design works on mobile, tablet, desktop
- Forms meet WCAG 2.1 AA accessibility standards
- The 2-8 tests written in 10.1 pass

---

### Phase 5: Background Jobs & Automation

#### Task Group 11: Cleanup Jobs & Automation
**Assigned specialist:** Backend Engineer
**Dependencies:** Task Groups 3, 8
**Effort:** M

- [ ] 11.0 Complete background cleanup jobs
  - [ ] 11.1 Write 2-8 focused tests for cleanup jobs
    - Test unverified account cleanup identifies correct accounts
    - Test deleted account cleanup respects 30-day window
    - Test reminder emails sent at correct intervals
    - Test hard delete removes all related data
  - [ ] 11.2 Create unverified account cleanup job
    - Schedule: Daily at 2 AM
    - Find users where emailVerified = false AND createdAt < 30 days ago
    - Send reminder emails at 7, 14, 28 days
    - Send final warning at 29 days
    - Hard delete users at 30 days (cascade to all related records)
    - Log cleanup actions for audit trail
    - Follow spec.md lines 350-357
  - [ ] 11.3 Create deleted account cleanup job
    - Schedule: Daily at 3 AM
    - Find users where status = DELETED AND deletedAt < 30 days ago
    - Hard delete users (cascade to all related records)
    - Preserve audit logs for GDPR compliance
    - Log cleanup actions
    - Follow spec.md lines 359-364
  - [ ] 11.4 Set up cron job infrastructure
    - Create /api/cron/cleanup-unverified endpoint
    - Create /api/cron/cleanup-deleted endpoint
    - Configure cron scheduling (use Vercel Cron or similar)
    - Add authentication for cron endpoints (API key or IP whitelist)
  - [ ] 11.5 Create reminder email scheduling logic
    - Track when reminders were sent (avoid duplicates)
    - Calculate days since registration
    - Send appropriate reminder based on days remaining
    - Use templates from Task Group 4
  - [ ] 11.6 Ensure cleanup job tests pass
    - Run ONLY the 2-8 tests written in 11.1
    - Verify cleanup jobs run correctly
    - Verify reminder emails sent at right times

**Acceptance Criteria:**
- Unverified accounts deleted after 30 days
- Reminder emails sent at 7, 14, 28, 29 days
- Deleted accounts hard-deleted after 30 days
- All related data cascades on hard delete
- Cleanup actions logged for audit trail
- The 2-8 tests written in 11.1 pass

---

### Phase 6: Testing & Quality Assurance

#### Task Group 12: Integration Testing & Security Testing
**Assigned specialist:** QA Engineer / Testing Specialist
**Dependencies:** All previous task groups
**Effort:** L

- [ ] 12.0 Review existing tests and fill critical gaps only
  - [ ] 12.1 Review tests from Task Groups 1-11
    - Review database model tests (Task 1.1)
    - Review utility function tests (Task 2.1)
    - Review email service tests (Task 3.1)
    - Review NextAuth tests (Task 5.1)
    - Review API endpoint tests (Tasks 6.1, 7.1, 8.1)
    - Review SSO tests (Task 9.1)
    - Review UI component tests (Task 10.1)
    - Review cleanup job tests (Task 11.1)
    - Total existing tests: approximately 16-24 tests
  - [ ] 12.2 Analyze test coverage gaps for THIS feature only
    - Identify critical integration points lacking coverage
    - Focus ONLY on gaps related to authentication feature
    - Prioritize end-to-end user workflows
    - Identify security testing gaps
  - [ ] 12.3 Write up to 10 additional strategic tests maximum
    - Integration test: Complete registration → verification → login flow
    - Integration test: Complete password reset flow
    - Integration test: SSO registration → onboarding → dashboard flow
    - Integration test: Account deletion → reactivation flow
    - Security test: Rate limiting enforcement on login endpoint
    - Security test: Session hijacking prevention
    - Security test: CSRF protection on forms
    - Security test: Password complexity enforcement
    - E2E test: User can register with Google and login again
    - E2E test: User can delete account and reactivate within 30 days
    - Do NOT write exhaustive coverage for all scenarios
  - [ ] 12.4 Run feature-specific tests only
    - Run ONLY tests related to authentication feature
    - Expected total: approximately 26-34 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
    - Generate test coverage report for auth feature only

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 26-34 tests total)
- Critical user workflows for authentication covered
- No more than 10 additional tests added by QA engineer
- Security requirements verified (rate limiting, CSRF, secure cookies)
- Testing focused exclusively on authentication feature

---

### Phase 7: Documentation & Deployment Preparation

#### Task Group 13: Documentation & Environment Setup
**Assigned specialist:** Technical Writer / DevOps Engineer
**Dependencies:** All previous task groups
**Effort:** S

- [ ] 13.0 Complete documentation and deployment preparation
  - [ ] 13.1 Create API documentation
    - Document all authentication endpoints
    - Include request/response examples
    - Document error codes and messages
    - Document rate limiting behavior
  - [ ] 13.2 Create setup instructions
    - Database setup and migration instructions
    - SendGrid account setup and template configuration
    - OAuth provider setup (Google, Facebook, Apple)
    - Environment variable configuration
    - Development environment setup
  - [ ] 13.3 Create security documentation
    - Password hashing implementation details
    - Session management and cookie security
    - Token generation and storage
    - Rate limiting configuration
    - GDPR compliance measures
  - [ ] 13.4 Prepare environment variables template
    - Create .env.example with all required variables
    - Document each variable's purpose
    - Provide example values (not real credentials)
    - Follow spec.md lines 852-886
  - [ ] 13.5 Create deployment checklist
    - Database migration steps
    - Environment variable verification
    - SendGrid template deployment
    - OAuth provider configuration verification
    - Cron job setup
    - Security settings verification (HTTPS, cookies, CORS)
  - [ ] 13.6 Create troubleshooting guide
    - Common issues and solutions
    - Email delivery troubleshooting
    - OAuth provider configuration issues
    - Database connection issues
    - Session/cookie issues

**Acceptance Criteria:**
- API documentation complete and accurate
- Setup instructions clear and comprehensive
- Environment variables documented
- Deployment checklist covers all steps
- Troubleshooting guide addresses common issues

---

## Execution Order

### Recommended Implementation Sequence:

**Week 1: Foundation**
1. Task Group 1: Database Schema & Migrations (3 days)
2. Task Group 2: Core Authentication Utilities (2 days)

**Week 2: Email & Core Auth**
3. Task Group 3: Email Service Integration (2 days)
4. Task Group 4: SendGrid Email Templates (2 days)
5. Task Group 5: NextAuth.js Configuration (1 day)

**Week 3: API Endpoints**
6. Task Group 6: Registration & Login API Endpoints (3 days)
7. Task Group 7: Password Reset API Endpoints (2 days)

**Week 4: Advanced Features & UI**
8. Task Group 8: Email Verification & Account Management (2 days)
9. Task Group 9: Social Authentication (SSO) Integration (3 days)

**Week 5: Frontend & Automation**
10. Task Group 10: Authentication UI Components (4 days)
11. Task Group 11: Cleanup Jobs & Automation (1 day)

**Week 6: Testing & Launch**
12. Task Group 12: Integration Testing & Security Testing (2 days)
13. Task Group 13: Documentation & Environment Setup (1 day)

### Parallel Work Opportunities:

- **Task Groups 3 & 5** can be worked on in parallel (different engineers)
- **Task Groups 6, 7, 8** can be partially parallelized (different endpoints, same engineer)
- **Task Group 4** (email templates) can be done in parallel with Task Groups 6-8 by a different team member
- **Task Group 10** (UI) can start once Task Groups 6-8 are partially complete
- **Task Group 13** (documentation) can be written progressively as features are completed

### Critical Path:
1 → 2 → 5 → 6 → 7 → 8 → 9 → 10 → 12

This critical path represents the minimum sequential dependencies. Other tasks can be parallelized around this path.

---

## Notes

- **Test Philosophy**: Each task group writes 2-8 focused tests for critical behaviors only. The testing-engineer's task group (12) adds maximum 10 additional tests to fill critical gaps. Total expected tests: 26-34 tests maximum.
- **Dependencies**: All file paths referenced are absolute paths from project root: `/Users/ddq/Documents/Git sites/tinicoach/`
- **Hungarian Language**: All user-facing text (error messages, success messages, email templates) must be in Hungarian
- **Security First**: Rate limiting, password hashing, secure cookies, and CSRF protection are non-negotiable requirements
- **GDPR Compliance**: Soft delete with 30-day reactivation, hard delete with cascade, parental consent tracking
- **Environment Setup**: Requires PostgreSQL database, SendGrid account, OAuth provider credentials before starting
- **Responsive Design**: All UI components must work on mobile (320px+), tablet (768px+), desktop (1024px+)
- **Accessibility**: All forms must meet WCAG 2.1 AA standards

---

## Key Deliverables Summary

1. **Database**: Prisma schema with User, Account, Session, VerificationToken models
2. **Backend**: 9 API endpoints for registration, login, password reset, email verification, account management
3. **Email**: 7 SendGrid templates in Hungarian for all transactional emails
4. **Frontend**: 8 UI components and 6 authentication pages
5. **Security**: Rate limiting, password hashing, secure sessions, CSRF protection
6. **Automation**: 2 cron jobs for account cleanup and reminder emails
7. **Testing**: 26-34 focused tests covering critical workflows and security
8. **Documentation**: API docs, setup instructions, deployment checklist
