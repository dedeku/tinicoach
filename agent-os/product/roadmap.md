# Product Roadmap

## Phase 1: MVP Launch (Core Value Delivery)

1. [ ] **Authentication & User Management** — Complete email/password registration with age verification, parental consent workflow for users under 16, email verification, and password reset functionality `M`

2. [ ] **Gratitude Journal (Core Feature)** — Full CRUD for journal entries with 3 gratitude fields, mood slider, reflection notes, list view with pagination, and weekly limit enforcement (3 for free, unlimited for premium) `M`

3. [ ] **Habit Tracker (Single Habit)** — Create and track one daily or weekday habit with check-in functionality, streak calculation, calendar visualization, and basic statistics `M`

4. [ ] **Dashboard & Navigation** — Build home screen with welcome header, quick actions, today's habits display, weekly activity stats, and bottom navigation (Home, Journal, Habits, Videos, Profile) `S`

5. [ ] **Subscription Management** — Integrate Stripe checkout for monthly/annual plans, implement feature gate logic (free vs premium), subscription status display, and webhook handling for renewals and cancellations `L`

6. [ ] **PWA Configuration** — Set up Progressive Web App with manifest.json, service worker for offline support, install prompts, and caching strategies for core features `S`

## Phase 2: Growth & Engagement Features

7. [ ] **Strengths Finder Quiz** — Build complete quiz flow with 20-30 questions, progress saving, scoring algorithm by strength category, results display with top 5 strengths, and limit enforcement (1x free, unlimited premium) `L`

8. [ ] **Community Voting System** — Create active question display with 3-4 answer options, voting functionality with one-vote-per-user validation, results visualization with bar charts, and percentage display `M`

9. [ ] **Video Library** — Build video catalog with thumbnail cards, category filtering, free/premium gating, embedded video player (Vimeo/YouTube), and optional watch progress tracking `M`

10. [ ] **Profile & Settings** — User profile management with name/email updates, birth date display, subscription details, push notification preferences, data export (GDPR), and account deletion `S`

## Phase 3: Retention & Premium Features

11. [ ] **Push Notifications System** — Implement OneSignal integration with permission request flow, daily motivational message cron job (8am), notification history for premium users, and user preference management `M`

12. [ ] **Onboarding Flow** — Create 3-4 slide welcome screens introducing key features, PWA installation instructions (iOS vs Android), and onboarding completion tracking `S`

13. [ ] **Multiple Habit Tracking** — Extend habit tracker to support up to 10 concurrent habits for premium users with individual streak tracking, habit statistics page, calendar view for last 90 days, and habit archive functionality `M`

14. [ ] **Enhanced Journal Features** — Add date range filtering, search functionality, mood trend charts (30-day view), journal entry statistics (total entries, streak, average mood), and export to PDF `M`

## Phase 4: Polish & Optimization

15. [ ] **Email Notifications** — Set up Resend/SendGrid for transactional emails (verification, password reset, subscription confirmations), weekly progress reports for engaged users, and parental consent reminder emails `S`

16. [ ] **CMS Integration** — Integrate Prismic for coach-managed content including daily messages, community voting questions, video metadata, onboarding slides, and quiz questions (pending final CMS decision) `L`

17. [ ] **Performance Optimization** — Optimize Lighthouse scores to 90+, implement lazy loading for images and videos, reduce bundle size, improve time-to-interactive, and enhance offline experience `M`

18. [ ] **Analytics & Monitoring** — Add user behavior tracking, feature usage analytics, error monitoring with Sentry, conversion funnel analysis, and retention cohort reports `S`

> Notes
> - Items ordered by technical dependencies and most direct path to achieving the mission
> - Each feature represents an end-to-end (frontend + backend) functional capability
> - Free tier provides genuine value to validate product-market fit before premium conversion
> - CMS integration deferred to Phase 4 to allow for final technology decision (Prismic vs Sanity)
