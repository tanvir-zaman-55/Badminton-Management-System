# 🏸 Badminton Arena Management System

A comprehensive, full-stack badminton facility management platform built with React, TypeScript, Convex, and Tailwind CSS.

![Tech Stack](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Convex](https://img.shields.io/badge/Convex-1.24-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-cyan)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Documentation](#documentation)
- [Environment Variables](#environment-variables)

## ✨ Features

### 🏟️ Court Management
- Multiple court booking options (hourly, weekly, monthly)
- Recurring bookings support
- Real-time availability checking
- Conflict prevention system
- Team bookings for group matches

### 👥 User Management
- Role-based access control (Admin, Trainer, User)
- Email verification with OTP (Resend API)
- Password reset functionality
- User profile management

### 💎 Membership System
- **Day Pass** - Free trial access
- **Regular** - ₹2,000/month (10% discount)
- **Premium** - ₹4,000/month (20% discount + priority booking)
- **VIP** - ₹7,000/month (30% discount + premium perks)
- Automatic discount application on bookings
- Membership analytics dashboard

### 🎓 Coaching & Training
- Trainer session management
- Student booking system
- Progress tracking
- Session scheduling with capacity limits
- Earnings dashboard for trainers

### 🏆 Team Management
- Create and join teams
- Team court bookings
- Member management
- Team statistics

### 📊 Analytics & Reporting
- Revenue tracking
- Booking analytics
- User engagement metrics
- Membership insights
- Trainer performance tracking

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Convex** - Real-time database and backend
- **Resend** - Email delivery service
- **Convex Auth** - Authentication system

### Key Libraries
- `date-fns` - Date manipulation
- `sonner` - Toast notifications
- `react-day-picker` - Date selection
- `class-variance-authority` - Component variants

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Convex account** ([sign up here](https://convex.dev))
- **Resend account** ([sign up here](https://resend.com)) - for email features

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tanvir-zaman-55/Badminton-Management-System.git
cd Badminton-Management-System
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Convex URL:
```bash
VITE_CONVEX_URL=your_convex_deployment_url
```

4. **Start Convex development server**
```bash
npx convex dev
```
This will:
- Create a new Convex project (first time only)
- Deploy your schema and functions
- Give you a deployment URL
- Watch for changes

5. **Start the development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Default Admin Credentials

For initial access:
```
Email: admin@example.com
Password: admin123
```

⚠️ **Important**: Change these credentials immediately after first login in production!

## 📦 Deployment

For complete deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy Steps

1. **Deploy Convex Backend**
```bash
npx convex deploy
```

2. **Set up environment variables in Convex**
```bash
npx convex env set RESEND_API_KEY your_resend_api_key
npx convex env set CONVEX_SITE_URL https://your-domain.com
```

3. **Build frontend**
```bash
npm run build
```

4. **Deploy to hosting**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy --prod`
   - AWS S3, Cloudflare Pages, etc.

## 📁 Project Structure

```
badminton-arena-management-system/
├── convex/                      # Backend code
│   ├── schema.ts               # Database schema
│   ├── simpleAuth.ts           # Authentication
│   ├── bookings.ts             # Booking management
│   ├── courts.ts               # Court management
│   ├── memberships.ts          # Membership system
│   ├── trainers.ts             # Trainer/coaching
│   ├── teams.ts                # Team management
│   ├── otp.ts                  # Email verification
│   └── ...
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   ├── sections/           # Landing page sections
│   │   ├── ui/                 # UI components
│   │   └── auth/               # Auth components
│   ├── pages/                  # Page components
│   │   ├── AdminDashboard.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── TrainerDashboard.tsx
│   │   └── ...
│   ├── lib/                    # Utilities
│   └── App.tsx                 # Main app component
├── DEPLOYMENT.md               # Deployment guide
├── API.md                      # API documentation
├── SETUP.md                    # Setup guide
├── TROUBLESHOOTING.md          # Common issues
└── package.json
```

## 👤 User Roles

### Admin
- Full system access
- Manage courts, users, and bookings
- View revenue analytics
- Monitor trainer sessions
- Create membership tiers

### Trainer
- Create coaching sessions
- Manage students
- View earnings
- Track attendance
- Set availability

### User
- Book courts
- Purchase memberships
- Join/create teams
- Book coaching sessions
- View booking history

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with production checklist
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[API.md](./API.md)** - API endpoints and usage
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Architecture and design decisions
- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly

## 🔐 Environment Variables

### Required Variables

```bash
# Convex Backend
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Email Service (Required for email verification)
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONVEX_SITE_URL=https://your-domain.com
```

### Optional Variables

See `.env.example` for all available configuration options including:
- OTP settings
- Rate limiting
- Feature flags
- Email configuration

## 🏗️ Development

### Running Tests
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
tsc --noEmit
```

## 🔒 Security

- ✅ Role-based access control (RBAC)
- ✅ Email verification via OTP
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ Secure session management
- ⚠️ Change default admin credentials
- ⚠️ Enable HTTPS in production
- ⚠️ Configure CORS properly
- ⚠️ Set up regular database backups

## 🐛 Troubleshooting

### Common Issues

**1. Convex connection errors**
- Ensure `VITE_CONVEX_URL` is set correctly
- Run `npx convex dev` before starting the app

**2. Email verification not working**
- Check `RESEND_API_KEY` in Convex environment
- Verify domain in Resend dashboard

**3. Membership plans not showing**
- Plans auto-initialize on first access
- Check Convex logs for errors

See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for more solutions.

## 📈 Performance

- ⚡ Real-time updates with Convex
- 🚀 Fast loading with Vite HMR
- 📱 Responsive design for all devices
- 🎨 Smooth animations with Framer Motion
- 💾 Optimistic UI updates

## 🤝 Contributing

This is a private project for [Company Name]. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for code review

## 📄 License

Proprietary - All rights reserved

## 👨‍💻 Developed By

**Tanvir Zaman**

Built with assistance from [Claude Code](https://claude.com/claude-code)

## 📞 Support

For deployment support or issues:
- Check documentation files in this repository
- Review Convex docs: https://docs.convex.dev
- Contact: [Your support email]

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
