# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Badminton Arena Management System** built with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Convex (serverless backend with real-time database)
- **UI**: Tailwind CSS + Radix UI components + Framer Motion
- **Email**: Resend for transactional emails (verification, password reset)
- **Authentication**: Custom authentication system with email verification and OTP

The application allows users to book badminton courts by time slot, with an admin dashboard for managing courts and viewing all bookings.

## Development Commands

### Starting Development
```bash
# Install dependencies
npm install

# Start both frontend and backend (preferred)
npm run dev

# Or start separately:
npm run dev:frontend  # Vite dev server on http://localhost:5173
npm run dev:backend   # Convex backend with hot reload
```

### Building and Testing
```bash
# Type check and build (used for CI/linting)
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Convex Deployment
```bash
# Deploy to production
npx convex deploy

# Run Convex dev server
npx convex dev
```

## Architecture

### Backend Architecture (Convex)

**Core Convex Functions Location**: `/convex/`

- **`simpleAuth.ts`** - Custom authentication system with bcrypt password hashing
  - `signUp`, `signIn`, `getUser`, `getUserByEmail`
  - `verifyEmail`, `resetPassword`, `requestEmailVerification`

- **`otp.ts`** - One-time password system for email verification and password reset
  - Rate limited: 3 requests per 15 minutes
  - Codes expire after 15 minutes
  - Max 5 verification attempts per code

- **`emails.ts`** - Email sending via Resend API
  - `sendWelcomeEmail`, `sendVerificationEmail`, `sendPasswordResetEmail`, `sendLoginAlert`
  - All emails logged in `emailLogs` table

- **`courts.ts`** - Court management (admin only)
  - `list` (query), `add` (mutation), `updateStatus` (mutation)

- **`bookings.ts`** - Booking management
  - `create` - Book a court for 1-hour time slot
  - `listForUser` - Get user's bookings
  - `listAll` - Admin view of all bookings
  - `cancel` - Cancel booking (owner or admin only)
  - Prevents double-booking via `by_court_and_date` index

- **`crons.ts`** - Scheduled tasks
  - Cleanup expired OTP codes (every 15 minutes)
  - Cleanup old email logs (daily at 2 AM UTC)

- **`schema.ts`** - Database schema definition
  - Core tables: `users`, `emailLogs`, `otpCodes`
  - Arena tables: `courts`, `bookings`

**Important Convex Patterns**:
- All functions use new syntax: `query({args, returns, handler})`
- Always include `args` and `returns` validators
- Use `withIndex()` for efficient queries, avoid `.filter()` when possible
- Booking conflict detection uses indexed query on `by_court_and_date`

### Frontend Architecture

**Component Organization**: `/src/`

- **`App.tsx`** - Main routing logic, authentication state management
  - Uses localStorage to persist userId
  - Manages auth views: signin, verify-email, forgot-password, reset-password
  - Conditional rendering: Admin/User Dashboard vs Public Landing Page

- **`/pages/`** - Full page components
  - `AdminDashboard.tsx` - Stats, court management, all bookings view
  - `UserDashboard.tsx` - User's bookings, court scheduler
  - `VerifyEmail.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` - Auth flows

- **`/components/ui/`** - Reusable UI components (Radix + Tailwind)
  - Button, Card, Dialog, Input, Calendar, Select, Tabs, etc.
  - Custom components: `pricing-card`, `stat-card`, `team-card`, `navigation`

- **`/components/sections/`** - Landing page sections
  - Hero, About, Features, Contact, Footer, Testimonials, Pricing, Gallery, etc.

- **`/components/auth/`** - Authentication components
  - `OTPInput.tsx` - 6-digit code input with auto-focus
  - `VerificationBanner.tsx` - Persistent banner prompting email verification

- **`/components/dashboard/`** - Dashboard-specific components
  - `CourtScheduler.tsx` - Date picker + time slot grid for booking
  - `MyBookings.tsx` - User's booking list with cancel functionality
  - `ManageCourts.tsx` - Admin court CRUD operations
  - `AdminAllBookings.tsx` - Admin view of all bookings
  - `StatsOverview.tsx` - Dashboard statistics cards

### Authentication Flow

1. **Sign Up**: User creates account → `signUp` mutation → userId stored in localStorage
2. **Email Verification**: Banner prompts verification → OTP sent via email → `verifyEmail` mutation
3. **Sign In**: Credentials validated → userId stored → Dashboard displayed based on role
4. **Password Reset**: Email entered → OTP sent → New password with OTP → `resetPassword` mutation

**Role-Based Access**:
- `role: "admin"` → AdminDashboard, court management, view all bookings
- `role: "user"` (default) → UserDashboard, book courts, view own bookings
- Admin role auto-assigned to `admin@example.com` during signup

### Booking System

**Time Slot Model**:
- Courts bookable in 1-hour slots
- `startTime` is hour of day (0-23), `endTime` is always `startTime + 1`
- `bookingDate` format: "YYYY-MM-DD"

**Conflict Prevention**:
- Index `by_court_and_date` enables efficient overlap checking
- Query checks for existing confirmed bookings at same court/date/time
- Only users and admins can cancel bookings

**Database Schema**:
```typescript
bookings: {
  userId: Id<"users">,
  courtId: Id<"courts">,
  bookingDate: string, // "YYYY-MM-DD"
  startTime: number,   // 0-23
  endTime: number,     // 1-24
  status: "confirmed" | "cancelled"
}
// Indexes: by_user, by_court_and_date
```

## Environment Variables

**Frontend (.env.local)**:
```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud  # Auto-generated
```

**Backend (Convex Dashboard → Settings → Environment Variables)**:
```bash
# Required for email functionality
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com  # or onboarding@resend.dev for testing

# Optional configurations
OTP_EXPIRY_MINUTES=15
MAX_OTP_ATTEMPTS=5
MAX_OTP_REQUESTS=3
```

## Key Implementation Notes

### Convex Function Syntax
Always use the new function syntax with explicit validators:
```typescript
export const myQuery = query({
  args: { userId: v.id("users") },
  returns: v.object({ name: v.string() }),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Efficient Queries
- Use `withIndex()` for filtering, not `.filter()` directly on table queries
- Index fields must be queried in order they're defined
- Example: `by_court_and_date: ["courtId", "bookingDate"]` requires querying courtId first

### Admin Authorization Pattern
```typescript
const user = await ctx.db.get(userId);
if (!user || user.role !== "admin") {
  throw new Error("User is not an admin.");
}
```

### React Query Patterns with Convex
```typescript
// Query with useQuery
const user = useQuery(api.simpleAuth.getUser, userId ? { userId } : "skip");

// Mutation with useMutation
const signIn = useMutation(api.simpleAuth.signIn);
await signIn({ email, password });
```

### Frontend State Management
- Authentication state in localStorage (userId)
- Convex queries are reactive and auto-update
- No additional state management library needed

## Common Tasks

### Adding a New Booking Feature
1. Update `convex/schema.ts` if new fields needed
2. Add query/mutation to `convex/bookings.ts` with proper validators
3. Create UI component in `src/components/dashboard/`
4. Import and use in `UserDashboard.tsx` or `AdminDashboard.tsx`

### Adding a New Court Property
1. Update court table validator in `convex/schema.ts`
2. Update `convex/courts.ts` mutations to handle new field
3. Update `ManageCourts.tsx` form component
4. Update `CourtScheduler.tsx` to display new property

### Modifying Authentication
- Password hashing: Uses `bcryptjs` in `convex/simpleAuth.ts`
- Session management: Client-side via localStorage
- Add new auth methods in `simpleAuth.ts`, update `App.tsx` routing

### Email Customization
- Email templates in `convex/emails.ts`
- Uses basic HTML, can be upgraded to React Email components
- All sends logged in `emailLogs` table for monitoring

## Testing

### Manual Testing Checklist
- Sign up new user → verify email → sign in
- Book court → view in "My Bookings" → cancel booking
- Admin: add court → update status → view all bookings
- Password reset flow with OTP
- Test rate limiting (3 OTP requests in 15 min)

### Development Admin Account
Default admin credentials (change in production):
```
Email: admin@example.com
Password: admin123
```

## Project Structure Reference
```
/convex/              # Backend functions
  schema.ts           # Database schema
  simpleAuth.ts       # Authentication
  otp.ts              # OTP system
  emails.ts           # Email sending
  bookings.ts         # Booking logic
  courts.ts           # Court management
  crons.ts            # Scheduled jobs

/src/
  App.tsx             # Main app & routing
  /pages/             # Full pages
  /components/
    /ui/              # Reusable UI components
    /sections/        # Landing page sections
    /auth/            # Auth-specific components
    /dashboard/       # Dashboard components
  /lib/
    utils.ts          # Utility functions
    themes.ts         # Theme configuration
```

## Deployment Checklist

1. Set production environment variables in Convex Dashboard
2. Configure custom domain in Resend + add DNS records
3. Deploy Convex backend: `npx convex deploy`
4. Build frontend: `npm run build`
5. Deploy `dist/` to hosting provider (Vercel, Netlify, etc.)
6. Update `VITE_CONVEX_URL` to production deployment URL
7. Change admin email in `convex/simpleAuth.ts` line 30
8. Test complete auth + booking flow in production

## Additional Documentation

- **SETUP.md** - Complete setup instructions for development
- **API.md** - Full API reference for all Convex functions
- **AUTH_GUIDE.md** - Detailed authentication flow documentation
- **TROUBLESHOOTING.md** - Common issues and solutions
