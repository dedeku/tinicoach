# Initial Spec Idea

## User's Initial Description
FEATURE NAME: Authentication & User Management
FEATURE DESCRIPTION: Complete authentication system including email/password registration, social auth (Google, Facebook, Apple), login, password reset, email verification, and transactional emails.

RAW USER REQUIREMENTS:
```
1. Registration Flow
- Age verification: Important, store parental consent info but don't handle consent flow yet
- Email verification: Send verification email, user can use app immediately but show toaster reminder. Delete account after X time if not verified.
- Required fields: email, fullname, nickname, birthdate, accept TOS

2. Password & Security
- Password requirements: min 8 chars, uppercase, lowercase, number
- Reset token valid: 24 hours
- Session: 28 days with "remember me" option

3. Social Auth (SSO)
- Providers: Google, Facebook, Apple
- Account linking: Try to link/merge if email matches
- SSO data: name, email, then birthdate during onboarding flow

4. Database & User Model
- Roles: Teen and Admin currently, leave option open for Coach/Parent later
- Profile data: profile pic, bio, gender and other fields handled during onboarding
- Soft delete: 30 days reactivation period

5. Transactional Emails
- Provider: SendGrid
- Email types: welcome, verification, password reset, password changed, account deletion, parental consent
- Language: Hungarian first, prepare for multi-language
- Branding: No branding yet, include basic template structure

6. Edge Cases
- Account recovery: Secondary email and/or mobile phone in onboarding/profile settings
- Email change: Not allowed
- Duplicate accounts: Don't allow, one email = one user
```

## Metadata
- Date Created: 2025-11-14
- Spec Name: authentication-user-management
- Spec Path: /Users/ddq/Documents/Git sites/tinicoach/agent-os/specs/2025-11-14-authentication-user-management
