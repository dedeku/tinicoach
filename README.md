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
# Database (Required)
# For Supabase: Use connection pooling URL for DATABASE_URL and direct URL for DIRECT_URL
# For Vercel Postgres: Use the same URL for both (or omit DIRECT_URL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # Required for Supabase, optional for Vercel Postgres

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

#### Supabase Configuration

When using Supabase PostgreSQL with Vercel:

**Option 1: Using Vercel Shared Environment Variables (Recommended - Already Configured)**

If you have Supabase linked to Vercel, the Prisma schema is already configured to use:
- `POSTGRES_PRISMA_URL` (connection pooling) - automatically provided by Vercel
- `POSTGRES_URL_NON_POOLING` (direct connection) - automatically provided by Vercel

**No additional configuration needed!** The Prisma schema (`prisma/schema.prisma`) is already set up to use these Vercel variables.

**If you're NOT using Vercel Supabase integration**, you can modify `prisma/schema.prisma` to use standard names:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Option 2: Manual Configuration**

1. **Get Connection Strings** from Supabase Dashboard → Settings → Database:
   - **Connection Pooling URL** (port 6543): Use for `DATABASE_URL`
     - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Direct Connection URL** (port 5432): Use for `DIRECT_URL`
     - Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

2. **Add to Vercel**: In Vercel dashboard → Project Settings → Environment Variables:
   - Add `DATABASE_URL` (connection pooling URL)
   - Add `DIRECT_URL` (direct connection URL)

**Why both?**
   - `DATABASE_URL`: Used for runtime queries (connection pooling for better performance)
   - `DIRECT_URL`: Used for Prisma migrations and introspection (requires direct connection)

### Vercel Setup

1. **Connect Repository**: Push to GitHub/GitLab/Bitbucket
2. **Import Project**: Import in Vercel dashboard
3. **Environment Variables**: Add all required env vars in Vercel dashboard
4. **Build Settings**: 
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default, includes --webpack flag)
   - Output Directory: `.next` (default)

### Database Setup

#### Vercel Postgres

When using Vercel Postgres:
- Database connection string is automatically provided via `DATABASE_URL`
- Set `DIRECT_URL` to the same value as `DATABASE_URL` (or omit it)
- Use Prisma with `prisma migrate deploy` in build command if needed
- Connection pooling is handled automatically

#### Supabase PostgreSQL

When using Supabase:
- **Required**: Both `DATABASE_URL` (pooling) and `DIRECT_URL` (direct) must be set
- Get connection strings from Supabase Dashboard → Settings → Database
- See "Supabase Configuration" section above for details

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
