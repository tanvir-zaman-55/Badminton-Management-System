# Badminton Arena Management System - Deployment Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Convex account (https://convex.dev)
- Resend account for email verification (https://resend.com)

## Environment Variables

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Convex
VITE_CONVEX_URL=your_convex_deployment_url

# Resend API (for email verification)
CONVEX_SITE_URL=http://localhost:5173  # Update for production
RESEND_API_KEY=your_resend_api_key_here
```

### Getting the Resend API Key

1. Sign up at https://resend.com
2. Go to API Keys section in your dashboard
3. Create a new API key
4. Copy the key and add it to your Convex environment variables

## Convex Setup

### 1. Install Convex CLI

```bash
npm install -g convex
```

### 2. Login to Convex

```bash
npx convex login
```

### 3. Create a New Convex Project

```bash
npx convex dev
```

This will:
- Create a new Convex project
- Link it to your local codebase
- Deploy your schema and functions
- Start the dev server

### 4. Set Environment Variables in Convex

Add the Resend API key to your Convex deployment:

```bash
npx convex env set RESEND_API_KEY your_resend_api_key_here
npx convex env set CONVEX_SITE_URL your_production_url
```

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

This will start both:
- Vite frontend server on http://localhost:5173
- Convex backend in development mode

## Default Admin Credentials

**IMPORTANT**: Use these credentials to log in as an administrator:

```
Email: admin@example.com
Password: admin123
```

### Creating the Admin Account

The admin account needs to be created manually in the Convex database. You can do this through the Convex dashboard:

1. Go to your Convex dashboard (https://dashboard.convex.dev)
2. Select your project
3. Go to the "Data" tab
4. Navigate to the `users` table
5. Add a new document with:
   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "password": "$2a$10$hashed_password_here",
     "role": "admin",
     "isActive": true,
     "createdAt": 1234567890000
   }
   ```

**Note**: For production, you should use the sign-up flow to create the admin user with a properly hashed password, then manually change their role to "admin" in the Convex dashboard.

## Features & User Roles

### Admin Features
- Manage courts (create, update, delete)
- View all bookings
- User management
- Create and manage membership tiers
- View revenue analytics
- Manage trainer sessions
- Access admin dashboard

### Trainer Features
- Create coaching sessions
- View student bookings
- Track student attendance
- Manage availability
- View earnings

### User Features
- Book courts (hourly, weekly, monthly)
- Recurring bookings
- Team bookings
- Browse and book trainer sessions
- Purchase memberships
- View booking history
- Join/create teams

## Email Verification

The system uses Resend for sending verification emails. Make sure to:

1. Verify your domain with Resend (for production)
2. Set up the `RESEND_API_KEY` in Convex environment variables
3. Configure the `CONVEX_SITE_URL` to match your production URL

### Email Verification Flow

1. User signs up
2. System sends verification email via Resend
3. User clicks verification link
4. Account is activated

## Production Deployment

### 1. Deploy Convex Backend

```bash
npx convex deploy
```

This will:
- Deploy all functions to production
- Apply schema changes
- Return your production Convex URL

### 2. Update Environment Variables

Update your `.env.production` file:

```bash
VITE_CONVEX_URL=your_production_convex_url
```

### 3. Build Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 4. Deploy Frontend

Deploy the `dist` folder to your hosting provider:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **AWS S3**: Upload dist folder to S3 bucket
- **Any static host**: Upload dist folder contents

### 5. Update Convex Environment for Production

```bash
npx convex env set CONVEX_SITE_URL https://your-production-domain.com --prod
```

## Database Schema

The system automatically creates the following tables:

- `users` - User accounts and authentication
- `courts` - Badminton courts
- `bookings` - Court bookings
- `membershipTiers` - Membership plans (auto-initialized)
- `memberships` - User memberships
- `trainers` - Trainer profiles
- `coachingSessions` - Coaching sessions
- `trainerReviews` - Trainer ratings and reviews
- `teams` - User teams
- `teamMembers` - Team membership

## Membership Plans

The system automatically initializes 4 default membership tiers:

1. **Day Pass** (Free) - 0% discount, 1 day duration
2. **Regular** (₹2,000) - 10% discount, 30 days duration, 2 free court hours
3. **Premium** (₹4,000) - 20% discount, 30 days duration, 5 free court hours, priority booking
4. **VIP** (₹7,000) - 30% discount, 30 days duration, 10 free court hours, priority booking

## Troubleshooting

### Email Verification Not Working

1. Check if `RESEND_API_KEY` is set in Convex environment
2. Verify your domain is configured in Resend
3. Check Convex logs for email sending errors
4. Ensure `CONVEX_SITE_URL` is correctly set

### Admin Login Issues

1. Verify admin user exists in `users` table
2. Check that `role` field is set to "admin"
3. Ensure `isActive` is true
4. Try resetting the password through the password reset flow

### Membership Plans Not Showing

1. The system auto-initializes membership tiers on first access
2. Check Convex logs for any initialization errors
3. Verify the `membershipTiers` table in Convex dashboard
4. If needed, manually add tiers through the Convex dashboard

### Booking Conflicts

1. The system prevents double-booking automatically
2. Check court opening hours in the `courts` table
3. Verify booking times don't overlap with existing bookings

## Security Considerations

### Production Checklist

- [ ] Change default admin password immediately
- [ ] Set up proper domain verification with Resend
- [ ] Enable HTTPS on your frontend
- [ ] Configure CORS properly in Convex
- [ ] Set up rate limiting
- [ ] Enable Convex authentication
- [ ] Back up your Convex database regularly
- [ ] Monitor error logs
- [ ] Set up proper user password requirements
- [ ] Enable two-factor authentication (if needed)

## Support & Maintenance

### Regular Maintenance

1. **Database Backups**: Convex provides automatic backups
2. **Monitor Logs**: Check Convex dashboard for errors
3. **Update Dependencies**: Run `npm update` regularly
4. **Security Updates**: Keep all packages up to date

### Monitoring

Monitor the following metrics:
- Active users
- Booking conversion rate
- Membership sign-ups
- Email delivery success rate
- API response times
- Error rates

## API Endpoints (Convex Functions)

### Authentication
- `simpleAuth.signIn` - User login
- `simpleAuth.signUp` - User registration
- `otp.sendVerificationEmail` - Send verification email
- `otp.verifyEmail` - Verify email with OTP

### Courts
- `courts.list` - List all courts
- `courts.create` - Create new court (admin)
- `courts.update` - Update court (admin)

### Bookings
- `bookings.create` - Create single booking
- `bookings.createRecurring` - Create recurring bookings
- `bookings.listForUser` - Get user's bookings
- `bookings.cancel` - Cancel booking

### Memberships
- `memberships.listTiers` - Get all membership tiers
- `memberships.getUserMembership` - Get user's active membership
- `memberships.purchaseMembership` - Purchase a membership plan

### Trainers
- `trainers.list` - List all trainers
- `trainers.createSession` - Create coaching session
- `trainers.bookSession` - Book a coaching session
- `trainers.getUserSessions` - Get user's booked sessions

### Teams
- `teams.list` - List all teams
- `teams.create` - Create a team
- `teams.join` - Join a team
- `teams.getUserTeams` - Get user's teams

## Contact & Support

For issues or questions:
- Check Convex documentation: https://docs.convex.dev
- Resend documentation: https://resend.com/docs
- GitHub Issues: [Your repository URL]

---

**Last Updated**: October 2025
**Version**: 1.0.0
