# tinicoach MVP

Teen Life Coaching App - Solution-Focused

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PWA** (next-pwa)
- **React Hook Form + Zod**
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (local testing)
npm run build

# Start production server (local testing)
npm start
```

## Git Repository

The project is initialized as a git repository with an initial commit.

### Connect to Remote Repository

To connect to a remote repository (GitHub, GitLab, Bitbucket):

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/tinicoach.git

# Or using SSH
git remote add origin git@github.com:yourusername/tinicoach.git

# Push to remote
git push -u origin main
```

### Branch Management

The default branch is `main`.

## Vercel Deployment

This project is configured for Vercel deployment.

### Environment Variables

Create a `.env.local` file for local development (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Prismic
PRISMIC_ACCESS_TOKEN="your-token"
NEXT_PUBLIC_PRISMIC_REPOSITORY="your-repo"

# OneSignal
ONESIGNAL_APP_ID="your-app-id"
ONESIGNAL_REST_API_KEY="your-api-key"
```

### Vercel Setup

1. **Connect Repository**: Push to GitHub/GitLab/Bitbucket
2. **Import Project**: Import in Vercel dashboard
3. **Environment Variables**: Add all required env vars in Vercel dashboard
4. **Build Settings**: 
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default, includes --webpack flag)
   - Output Directory: `.next` (default)

### Vercel Postgres

When using Vercel Postgres:
- Database connection string is automatically provided via `DATABASE_URL`
- Use Prisma with `prisma migrate deploy` in build command if needed
- Connection pooling is handled automatically

## PWA Icons

Add the following icon files to `/public`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

These are referenced in `public/manifest.json` and required for PWA installation.

## Project Structure

```
tinicoach/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── public/           # Static assets
│   └── manifest.json # PWA manifest
├── docs/             # Project documentation
└── agent-os/         # Agent OS configuration
```

## Next Steps

1. Add PWA icons (icon-192.png, icon-512.png)
2. Set up Prisma + Vercel Postgres
3. Configure NextAuth.js
4. Set up Stripe integration
5. Configure Prismic CMS
6. Set up OneSignal for push notifications

## Development Notes

- PWA is disabled in development mode (`NODE_ENV === "development"`)
- Service Worker is generated automatically in production builds
- Build script includes `--webpack` flag automatically (required for next-pwa compatibility)
