# Tech Stack

## Framework & Runtime

- **Application Framework:** Next.js 14+ (App Router)
- **Language/Runtime:** TypeScript / Node.js
- **Package Manager:** npm

## Frontend

- **JavaScript Framework:** React 19
- **CSS Framework:** Tailwind CSS
- **Form Management:** React Hook Form
- **Validation:** Zod
- **Markdown Rendering:** react-markdown with remark-gfm
- **UI Components:** Radix UI with Tailwind

## Database & Storage

- **Database:** PostgreSQL (Vercel Postgres or Supabase)
- **ORM/Query Builder:** Prisma ORM
- **Caching:** To be determined based on scale needs

## Authentication

- **Authentication:** NextAuth.js
- **Session Management:** JWT tokens / Server sessions

## Progressive Web App

- **PWA Framework:** next-pwa
- **Service Worker:** Workbox (via next-pwa)
- **Offline Support:** Cache-first strategies for static assets
- **Install Prompts:** Platform-specific (iOS Safari, Chrome)

## Mobile Native (Future - Phase 2)

- **Native Runtime:** Capacitor (planned for Phase 2 migration)
- **Build Strategy:** Static export for Capacitor, separate API deployment
- **Native Plugins:** Camera, Push Notifications, Biometrics, Haptics, Storage

## Testing & Quality

- **Linting:** Next.js built-in ESLint configuration
- **Formatting:** To be determined (Prettier recommended)
- **Test Framework:** To be determined (Jest recommended)

## Deployment & Infrastructure

- **Hosting:** Vercel
- **CI/CD:** Vercel automatic deployments (GitHub integration)
- **Domain:** Custom domain (tinilany.hu or similar)
- **Environment Management:** Vercel environment variables

## Third-Party Services

### Payments
- **Provider:** Stripe
- **Features:** Checkout sessions, subscription management, webhooks
- **Plans:** Monthly (2,990 HUF) and Annual (29,990 HUF)

### Content Management (Pending Decision)
- **CMS:** Prismic (recommended) or Sanity (under evaluation)
- **Usage:** Daily messages, video metadata, community questions, quiz content, onboarding slides
- **Integration Timeline:** Phase 4 (after core features validated)

### Push Notifications
- **Provider:** OneSignal
- **Features:** Web push notifications, scheduled messages, segmentation
- **Plan:** Free tier (<10k users)

### Email Services
- **Provider:** Resend or SendGrid
- **Usage:** Transactional emails (verification, password reset, subscription confirmations)
- **Volume:** Low to moderate

### Monitoring & Analytics
- **Error Tracking:** Sentry (recommended for production)
- **Analytics:** To be determined (Google Analytics or privacy-focused alternative)
- **Performance Monitoring:** Vercel Analytics

## Development Tools

- **Version Control:** Git / GitHub
- **Code Editor:** Any (VS Code recommended)
- **API Testing:** To be determined (Postman, Insomnia, or Thunder Client)
- **Database Management:** Prisma Studio

## Standards & Compliance

- **Language Support:** Hungarian (primary), English (future)
- **Accessibility:** WCAG 2.1 AA minimum
- **Privacy:** GDPR compliant with special provisions for users under 16
- **Security:** HTTPS, rate limiting, input validation, secure session management
- **Performance Target:** Lighthouse score 90+

## Architecture Patterns

- **Frontend Architecture:** Server-side rendering with App Router, client components where needed
- **API Architecture:** Next.js API Routes (RESTful)
- **State Management:** React hooks and context where needed (no global state library initially)
- **File Structure:** Feature-based organization (by domain: auth, journal, habits, etc.)

## Future Considerations

### Phase 2 (Capacitor Migration)
- Static export build for frontend
- Separate API deployment (may require migration from Next.js API Routes to standalone backend)
- Native plugin integration (biometrics, better offline storage, local notifications)
- App Store distribution (iOS: $99/year, Android: $25 one-time)

### Scaling Considerations
- **Caching Layer:** Redis for session management and frequently accessed data
- **CDN:** Vercel Edge Network (included)
- **Database:** Connection pooling via Prisma, potential read replicas at scale
- **Background Jobs:** Vercel Cron for scheduled tasks (daily notifications)

### Alternative Technologies Under Consideration
- **CMS:** Sanity as alternative to Prismic (more developer control, better free tier)
- **Mobile:** Native Capacitor apps for App Store presence and enhanced native features
- **Email:** Resend vs SendGrid (Resend has better DX, SendGrid has more features)
