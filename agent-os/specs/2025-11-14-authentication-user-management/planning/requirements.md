# Authentication & User Management - Requirements

## Overview
Complete authentication system for tinicoach platform including email/password registration, social authentication (Google, Facebook, Apple), login, password reset, email verification, and transactional emails.

## Target Users
- Primary: Hungarian teenagers (13-18 years old)
- Secondary: Parents of teens
- Admin users for platform management

## 1. Registration Flow

### Age Verification & Parental Consent
- **Age tracking**: Collect birthdate during registration to track user age
- **Parental consent flag**: Store parental consent information in database
- **Consent flow**: NOT implemented in this spec - store the data for future implementation
- **Age restrictions**: Track but don't enforce age limits in this phase

### Email Verification
- Send verification email immediately after registration
- User can access and use the app without verifying email
- Show persistent toaster notification reminding user to verify email
- **Auto-deletion**: Delete unverified accounts after X days (specify in spec)
- Verification link should be valid for 24 hours

### Registration Fields (Required)
- Email address (unique, validated format)
- Password (meets security requirements)
- Full name
- Nickname (display name)
- Birthdate (for age tracking and parental consent)
- Accept Terms of Service checkbox

### Validation Rules
- Email: Valid format, unique in system
- Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Full name: Required, non-empty
- Nickname: Required, non-empty (can be same as first name)
- Birthdate: Valid date, user must be born (not future date)
- Terms acceptance: Must be checked to proceed

## 2. Password & Security

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- No maximum length restriction

### Password Reset Flow
- User requests password reset via email
- Send reset link to registered email
- Reset token valid for 24 hours
- After successful reset, send confirmation email
- Invalidate all existing sessions after password change

### Session Management
- Default session duration: 28 days
- "Remember me" checkbox option during login
- If "Remember me" unchecked, session expires when browser closes
- Support "Logout from all devices" functionality
- Store session tokens securely (HttpOnly, Secure, SameSite cookies)

## 3. Social Authentication (SSO)

### Supported Providers
- Google OAuth 2.0
- Facebook Login
- Apple Sign In

### Account Linking Strategy
- If SSO email matches existing email account → attempt to link accounts
- If no existing account → create new account with SSO data
- User can link multiple SSO providers to same account
- Email from SSO provider must be verified by provider

### SSO Data Collection
**From SSO provider:**
- Email address
- Full name
- Profile picture (optional)

**Required from user (during onboarding):**
- Birthdate (collected in onboarding flow, not during SSO registration)
- Nickname (can default to first name from SSO)
- Accept Terms of Service

### SSO Flow
1. User clicks "Continue with Google/Facebook/Apple"
2. Redirect to provider authentication
3. Provider returns with user data
4. Check if email exists in database:
   - **Exists**: Link SSO provider to existing account, log user in
   - **New**: Create new user account with SSO data
5. If new account: Redirect to onboarding flow to collect birthdate
6. If existing account: Log user in directly

## 4. Database & User Model

### User Roles (Current)
- **Teen**: Default role for registered users
- **Admin**: Platform administrators

### User Roles (Future - Leave Open)
- **Coach**: Content creators and coaches
- **Parent**: Parent accounts linked to teen accounts

### Core User Fields
**Authentication:**
- id (UUID, primary key)
- email (unique, indexed)
- password (hashed, nullable for SSO-only users)
- emailVerified (boolean, default false)
- emailVerifiedAt (timestamp, nullable)

**Profile:**
- fullName (string)
- nickname (string)
- birthdate (date)
- profilePicture (string, URL, nullable)
- bio (text, nullable)
- gender (enum, nullable - handled in onboarding)

**Metadata:**
- role (enum: teen, admin, coach, parent)
- parentalConsentGiven (boolean, default false)
- parentalConsentDate (timestamp, nullable)
- termsAcceptedAt (timestamp)
- createdAt (timestamp)
- updatedAt (timestamp)

**Account Status:**
- status (enum: active, deleted, suspended)
- deletedAt (timestamp, nullable)
- reactivationToken (string, nullable)

**Sessions & Security:**
- lastLoginAt (timestamp, nullable)
- passwordChangedAt (timestamp, nullable)

### Related Tables

**Account (SSO Providers):**
- id (UUID, primary key)
- userId (FK to User)
- provider (enum: google, facebook, apple)
- providerAccountId (string, provider's user ID)
- accessToken (encrypted, nullable)
- refreshToken (encrypted, nullable)
- expiresAt (timestamp, nullable)
- createdAt (timestamp)

**VerificationToken (Email Verification):**
- id (UUID, primary key)
- userId (FK to User)
- token (string, unique, indexed)
- type (enum: email_verification, password_reset)
- expiresAt (timestamp)
- createdAt (timestamp)

**Session:**
- id (UUID, primary key)
- userId (FK to User)
- sessionToken (string, unique, indexed)
- expiresAt (timestamp)
- createdAt (timestamp)

### Account Deletion (Soft Delete)
- Mark account as "deleted" (status = deleted)
- Set deletedAt timestamp
- Generate reactivation token (valid for 30 days)
- User can reactivate within 30 days via email link
- After 30 days: Hard delete user data (GDPR compliance)
- Delete associated sessions immediately
- Keep audit trail of deletion for compliance

## 5. Transactional Emails

### Email Service Provider
- **Provider**: SendGrid
- **Integration**: SendGrid API with templates

### Email Types

**1. Welcome Email**
- **Trigger**: Successful registration (email/password or SSO)
- **Contents**: Welcome message, overview of platform features, email verification link
- **Language**: Hungarian (prepare for multi-language)

**2. Email Verification**
- **Trigger**: Registration or manual re-send request
- **Contents**: Verification link (24-hour expiry), instructions
- **CTA**: "Verify Email Address" button

**3. Password Reset**
- **Trigger**: User requests password reset
- **Contents**: Reset link (24-hour expiry), security notice
- **CTA**: "Reset Password" button
- **Security**: Include warning about not sharing link

**4. Password Changed Confirmation**
- **Trigger**: Successful password change
- **Contents**: Confirmation message, instructions if user didn't make change
- **Security**: Include "Contact Support" link if suspicious

**5. Account Deletion Confirmation**
- **Trigger**: User deletes account
- **Contents**: Confirmation of deletion, reactivation link (30-day expiry), data deletion timeline
- **CTA**: "Reactivate Account" button (if within 30 days)

**6. Parental Consent Request** (Future)
- **Trigger**: User under 16 registers (future implementation)
- **Contents**: Request for parental consent, explanation of data usage
- **Recipient**: Parent email address provided by teen
- **Status**: NOT implemented in this spec, prepare email template only

### Email Template Structure
- **Branding**: No existing branding guidelines - create basic, clean template
- **Language**: Primary language is Hungarian, structure for future multi-language support
- **Components**: Header, body, CTA button, footer with unsubscribe/legal links
- **Responsive**: Mobile-friendly design
- **Plain text fallback**: All emails must have plain text version

### Email Template Variables
Each email template should support:
- `{{userName}}` - User's full name or nickname
- `{{userEmail}}` - User's email address
- `{{actionLink}}` - Verification/reset/reactivation link
- `{{expiryTime}}` - Link expiration time (e.g., "24 hours")
- `{{supportEmail}}` - Platform support email
- `{{currentYear}}` - For copyright footer

## 6. Edge Cases & Special Scenarios

### Account Recovery (No Email Access)
- **Solution**: Secondary email and/or mobile phone
- **Implementation**: Add fields in onboarding flow or profile settings
- **Scope**: NOT in this spec - prepare database fields only
- **Fields to add**: secondaryEmail (string, nullable), phoneNumber (string, nullable)

### Email Change Requests
- **Policy**: Email changes are NOT allowed
- **Rationale**: Email is primary identifier, changing causes complexity
- **User Action**: If user needs new email, must create new account

### Duplicate Account Prevention
- **Rule**: One email = one user account
- **Validation**: Check email uniqueness during registration
- **Error Message**: "This email is already registered. Please login or use password reset."
- **SSO Duplicate**: If SSO email exists, link to existing account (don't create duplicate)

### Unverified Account Cleanup
- **Policy**: Delete accounts that remain unverified after X days
- **Recommended**: 30 days
- **Process**:
  - Send reminder email at 7 days, 14 days, 28 days
  - Final warning at 29 days
  - Auto-delete at 30 days if still unverified
- **Scope**: Cleanup job implementation in this spec

### Session Security
- **Concurrent sessions**: Allow multiple sessions (different devices)
- **Session hijacking prevention**: Bind session to IP and User-Agent (optional, may cause issues with mobile)
- **Logout all devices**: Invalidate all session tokens for user

### SSO Edge Cases
- **Provider email changes**: User changes email at provider (Google/Facebook) - handle gracefully
- **Provider account deletion**: If user deletes SSO provider account, they can still login with password (if set)
- **Multiple SSO same email**: User can link Google, Facebook, Apple to same account if emails match

## 7. Security Requirements

### Data Protection
- **Password hashing**: bcrypt with salt (cost factor 10-12)
- **Token storage**: Hashed tokens in database
- **Sensitive data**: Encrypt SSO tokens (accessToken, refreshToken)
- **GDPR compliance**: Right to deletion, data export, consent tracking

### Rate Limiting
- Login attempts: 5 attempts per 15 minutes per IP
- Password reset requests: 3 requests per hour per email
- Email verification resend: 3 requests per hour per email
- Registration: 5 registrations per hour per IP

### CSRF Protection
- All forms must include CSRF tokens
- NextAuth.js handles this automatically

### Cookie Security
- HttpOnly: Yes (prevent XSS)
- Secure: Yes (HTTPS only)
- SameSite: Lax or Strict
- Domain: Platform domain only

## 8. User Experience Requirements

### Error Messages (Hungarian)
- Invalid email format: "Kérlek, adj meg egy érvényes email címet"
- Email already exists: "Ez az email cím már regisztrálva van"
- Weak password: "A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűt, valamint számot"
- Invalid credentials: "Hibás email vagy jelszó"
- Expired token: "Ez a link lejárt. Kérj új jelszó visszaállítási linket"
- Account not found: "Nincs ilyen fiók"

### Success Messages (Hungarian)
- Registration success: "Sikeres regisztráció! Küldtünk egy megerősítő emailt"
- Email verified: "Email cím sikeresen megerősítve!"
- Password reset sent: "Jelszó visszaállítási linket küldtünk az email címedre"
- Password changed: "Jelszó sikeresen megváltoztatva"
- Logged in: "Sikeres bejelentkezés!"

### Loading States
- Show loading spinners during async operations
- Disable submit buttons to prevent double-submission
- Display progress for multi-step flows

### Toaster Notifications
- Email verification reminder: Show on dashboard/main pages until verified
- Dismissible but reappears on next page load until verified
- Include "Resend verification email" link in toaster

## 9. Technical Implementation Notes

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Auth Library**: NextAuth.js v5 (Auth.js)
- **Database**: PostgreSQL with Prisma ORM
- **Email**: SendGrid API
- **SSO**: OAuth 2.0 (Google, Facebook, Apple providers)

### API Endpoints Needed
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email?token=` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/[provider]` - SSO login (NextAuth handles)
- `GET /api/auth/callback/[provider]` - SSO callback (NextAuth handles)
- `POST /api/auth/reactivate?token=` - Reactivate deleted account

### Environment Variables
```
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

## 10. Success Criteria

### Functional Requirements
- [ ] Users can register with email/password
- [ ] Users can register/login with Google, Facebook, Apple
- [ ] Users can login with email/password
- [ ] Users can request password reset
- [ ] Users can reset password via email link
- [ ] Users receive email verification link
- [ ] Unverified users see toaster reminder
- [ ] Users can resend verification email
- [ ] Email verification link expires after 24 hours
- [ ] Password reset link expires after 24 hours
- [ ] Sessions last 28 days (or browser close without remember me)
- [ ] Users can logout from current device
- [ ] Users can logout from all devices
- [ ] SSO accounts link to existing email accounts
- [ ] All transactional emails sent successfully
- [ ] Soft delete with 30-day reactivation period

### Security Requirements
- [ ] Passwords hashed with bcrypt
- [ ] Rate limiting on all auth endpoints
- [ ] CSRF protection on all forms
- [ ] Secure, HttpOnly cookies for sessions
- [ ] SSO tokens encrypted in database
- [ ] No duplicate accounts (email uniqueness enforced)

### UX Requirements
- [ ] Clear, helpful error messages in Hungarian
- [ ] Loading states on all async operations
- [ ] Responsive design (mobile-friendly)
- [ ] Accessible forms (WCAG 2.1 AA)
- [ ] Email verification toaster non-intrusive but visible

### Performance Requirements
- [ ] Login response time < 500ms
- [ ] Registration response time < 1s
- [ ] Email delivery within 1 minute
- [ ] Password reset process < 2 minutes end-to-end

## 11. Out of Scope (Future Phases)

- Parental consent workflow (UI and email flow)
- Secondary email/phone for account recovery
- Email change functionality
- Two-factor authentication (2FA)
- Magic link authentication (passwordless)
- Account linking UI (link/unlink SSO providers)
- Admin panel for user management
- User impersonation (admin feature)
- Audit logging of auth events
- Export user data (GDPR data portability)

## 12. Dependencies

### External Services
- SendGrid account with API key
- Google OAuth 2.0 credentials
- Facebook App with Login configured
- Apple Developer account with Sign In with Apple

### Database Setup
- PostgreSQL instance
- Prisma migrations configured
- Database connection pooling

### Environment Setup
- HTTPS enabled (required for secure cookies and SSO)
- Domain configured for OAuth redirects
- Email domain verified in SendGrid

## 13. Testing Requirements

### Unit Tests
- Password hashing and validation
- Email format validation
- Token generation and verification
- Rate limiting logic

### Integration Tests
- Complete registration flow (email/password)
- Complete SSO registration flow (each provider)
- Login flow with valid/invalid credentials
- Password reset flow end-to-end
- Email verification flow
- Account soft delete and reactivation
- Account linking (SSO to existing email)

### E2E Tests
- User can register, verify email, login
- User can reset password and login with new password
- User can register with Google and login again
- User can delete account and reactivate within 30 days

### Security Tests
- SQL injection attempts blocked
- XSS attempts blocked
- CSRF protection working
- Rate limiting enforced
- Password complexity enforced
- Session hijacking prevented

## Questions/Clarifications Needed

1. **Unverified account deletion**: Confirm number of days (suggested 30 days)
2. **Admin role creation**: How are admin accounts created? Seed data or special registration flow?
3. **Profile picture storage**: Where to store uploaded profile pictures? (S3, Cloudinary, local?)
4. **Gender field**: What options for gender enum? (male, female, other, prefer-not-to-say?)
5. **Subscription integration**: Should User model include subscription status fields, or separate table?
6. **Multi-language**: Priority for English language support? Timeline?
7. **SendGrid templates**: Use SendGrid dynamic templates or custom HTML in codebase?
8. **SSO profile pictures**: Store URL from provider or download and host locally?
