# Float Business

A multi-tenant e-commerce platform where business owners can create their own online stores with Paystack payment integration.

## Features

- 🏪 Create and manage multiple online stores
- 🎨 5 beautiful, mobile-first themes to choose from
- 💳 Paystack payment integration with split payments
- 📦 Product management (add, delete)
- 📊 Order tracking
- 🔐 Secure authentication with Supabase

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Paystack
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account
- A Paystack account

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd float-business
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Set up the database by running the SQL in `/supabase/schema.sql` in your Supabase SQL editor.

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app              - Next.js App Router pages
/components       - Reusable React components
/themes           - Store theme components (Theme1-5)
/lib              - Utility libraries (supabase, paystack, helpers)
/types            - TypeScript type definitions
/supabase         - Database schema and migrations
/middleware.ts    - Auth middleware for protected routes
```

## Deployment

This project is configured for deployment on Vercel. Push to your repository and connect it to Vercel.

Make sure to add all environment variables in your Vercel project settings.