# Badminton Arena Management System - Project Overview

## Current Implementation Status

### ✅ Completed Features
- **Authentication System**: Sign up, sign in, email verification, password reset with OTP
- **User Management**: Basic user profiles with admin/user roles
- **Court Management**: Add courts, update status (open/maintenance)
- **Basic Booking**: 1-hour time slots, conflict prevention, booking history
- **Cancellation**: Users can cancel their own bookings, admins can cancel any
- **Admin Dashboard**: View all bookings, manage courts, basic stats
- **User Dashboard**: View personal bookings, book new courts

### 🔄 Partially Implemented
- **Member Profiles**: Basic user data exists, needs expansion
- **Calendar View**: Basic date picker, needs full calendar visualization
- **Payment Tracking**: No payment system yet
- **Analytics**: Basic stats only

## Requirements Analysis & Implementation Roadmap

### PHASE 1: Core Facility & Booking Enhancements (Easiest) ⭐
**Estimated Time: 3-4 days**

#### 1.1 Operating Hours Management
- Add operating hours to arena settings
- Restrict bookings to operating hours only
- Different hours for weekdays/weekends
- **Schema**: `arenaSettings` table

#### 1.2 Pricing Tiers
- Define pricing structure (peak/off-peak, weekday/weekend)
- Automatic price calculation based on time slot
- Display prices in booking interface
- **Schema**: `pricingRules` table

#### 1.3 Enhanced Time Slot Management
- Configurable slot durations (30 min, 1 hour, 1.5 hours)
- Court-specific slot durations
- Better time slot grid UI
- **Schema**: Update `bookings` table, add `slotDuration` to courts

#### 1.4 Booking Improvements
- Add booking notes/comments field
- Add booking purpose (practice, match, training)
- Show pricing during booking flow
- **Schema**: Update `bookings` table with new fields

#### 1.5 Enhanced Court Management
- Court descriptions and amenities
- Court images/photos
- Court capacity (number of players)
- Surface type (wooden, synthetic, etc.)
- **Schema**: Update `courts` table

---

### PHASE 2: Member Management & Extended Bookings (Easy-Medium) ⭐⭐
**Estimated Time: 4-5 days**

#### 2.1 Membership Tiers
- Create membership levels (Regular, Premium, VIP, Day Pass)
- Membership benefits (discounts, priority booking, etc.)
- Membership expiry tracking
- **Schema**: `membershipTiers`, `memberships` tables

#### 2.2 Enhanced Member Profiles
- Contact information (phone, emergency contact)
- Preferences (favorite courts, preferred times)
- Profile photos
- Date of birth, gender
- **Schema**: Update `users` table

#### 2.3 Guest Management
- Guest booking without full registration
- Guest information capture
- Convert guest to member
- **Schema**: Add `guestBookings` table or `isGuest` flag

#### 2.4 Recurring Bookings
- Weekly/monthly recurring bookings
- Series management (edit/cancel series)
- Recurring booking rules and limits
- **Schema**: `recurringBookings`, `bookingSeries` tables

#### 2.5 Booking Rescheduling
- Move booking to different time/date
- Reschedule policies and restrictions
- Reschedule history
- **Schema**: Add reschedule tracking to `bookings`

#### 2.6 Waitlist Management
- Join waitlist for fully booked slots
- Automatic notifications when slots open
- Waitlist priority system
- **Schema**: `waitlist` table

#### 2.7 Multi-Court Booking
- Book multiple courts at once
- Group booking discounts
- Linked bookings (cancel all together)
- **Schema**: `bookingGroups` table

---

### PHASE 3: Payment & Financial Management (Medium) ⭐⭐⭐
**Estimated Time: 5-6 days**

#### 3.1 Payment Recording System
- Record manual payments (cash, card, bank transfer)
- Payment status tracking (paid, unpaid, partial)
- Multiple payment methods per booking
- **Schema**: `payments`, `paymentMethods` tables

#### 3.2 Invoice & Receipt Generation
- Automatic invoice generation
- PDF invoice/receipt export
- Email invoices to customers
- Invoice numbering system
- **Schema**: `invoices` table

#### 3.3 Pricing Calculator
- Automatic cost calculation
- Membership discounts
- Multi-booking discounts
- Tax calculations
- **Schema**: Update pricing logic

#### 3.4 Refund Management
- Record refunds for cancellations
- Refund policies (full/partial/none)
- Refund tracking and reporting
- **Schema**: `refunds` table

#### 3.5 Payment Dashboard
- Revenue overview
- Pending payments
- Payment history
- Outstanding amounts
- **Schema**: Aggregation queries

---

### PHASE 4: Team & Trainer Management (Medium-Hard) ⭐⭐⭐⭐
**Estimated Time: 6-7 days**

#### 4.1 Team Management
- Create and manage teams/clubs
- Team member management
- Team profiles with details
- Team booking capabilities
- **Schema**: `teams`, `teamMembers` tables

#### 4.2 League/Tournament Management
- Create leagues and tournaments
- Match scheduling
- Standings and results
- Tournament brackets
- **Schema**: `leagues`, `tournaments`, `matches` tables

#### 4.3 Team Communication
- Team messaging system
- Announcements and notifications
- Team activity feed
- **Schema**: `teamMessages`, `teamAnnouncements` tables

#### 4.4 Trainer/Coach Management
- Trainer profiles with credentials
- Specializations and certifications
- Trainer availability calendars
- **Schema**: `trainers` table

#### 4.5 Coaching Sessions
- Book coaching sessions
- Session types (group, private, assessment)
- Student progress tracking
- Attendance management
- **Schema**: `coachingSessions`, `sessionAttendance` tables

#### 4.6 Trainer Assignments
- Assign trainers to courts/sessions
- Trainer scheduling conflicts
- Trainer payment tracking
- **Schema**: Link trainers to bookings

#### 4.7 Performance Reviews
- Student feedback on trainers
- Trainer ratings
- Performance analytics
- **Schema**: `trainerReviews` table

---

### PHASE 5: Analytics, Reporting & Advanced Features (Hard) ⭐⭐⭐⭐⭐
**Estimated Time: 7-8 days**

#### 5.1 Comprehensive Reporting
- Revenue reports (daily, weekly, monthly, custom)
- Court utilization reports
- Member activity reports
- Trainer performance reports
- Booking analytics
- Export to PDF/Excel
- **Implementation**: Complex queries + report generator

#### 5.2 Advanced Analytics Dashboard
- Interactive charts and graphs
- Revenue trends
- Peak hours analysis
- Member retention metrics
- Predictive analytics
- **Implementation**: Data visualization library

#### 5.3 Enhanced Notification System
- SMS notifications (via Twilio/similar)
- WhatsApp integration
- Push notifications
- Notification preferences
- Bulk messaging
- **Schema**: `notifications`, `notificationPreferences` tables

#### 5.4 System Administration
- Detailed activity logs
- User permission management
- Multi-location support
- System configuration UI
- Data backup/export
- **Schema**: `activityLogs`, `locations`, `permissions` tables

#### 5.5 Advanced Calendar Views
- Full-screen calendar
- Drag-and-drop rescheduling
- Color-coded bookings
- Filter by court/member/status
- Calendar sync (Google, Outlook)
- **Implementation**: Advanced calendar component

---

## Technical Architecture

### Database Schema Overview

#### Existing Tables
```typescript
- users (with role, emailVerified, etc.)
- courts (name, status)
- bookings (userId, courtId, date, time, status)
- emailLogs
- otpCodes
```

#### New Tables Required

**Phase 1:**
```typescript
arenaSettings {
  locationId: Id<"locations">,
  openingTime: string,        // "06:00"
  closingTime: string,        // "23:00"
  weekdayHours: object,       // Different hours per day
  defaultSlotDuration: number // 60 minutes
}

pricingRules {
  name: string,               // "Peak Hour", "Weekend"
  startTime: string,
  endTime: string,
  daysOfWeek: number[],       // [0,1,2,3,4,5,6]
  pricePerHour: number,
  applicableCourts: Id<"courts">[],
  priority: number            // For overlapping rules
}
```

**Phase 2:**
```typescript
membershipTiers {
  name: string,               // "Regular", "Premium", "VIP"
  price: number,
  duration: number,           // days
  benefits: object,           // {discount: 10, priorityBooking: true}
  description: string
}

memberships {
  userId: Id<"users">,
  tierId: Id<"membershipTiers">,
  startDate: number,
  expiryDate: number,
  status: "active" | "expired" | "cancelled",
  autoRenew: boolean
}

recurringBookings {
  userId: Id<"users">,
  courtId: Id<"courts">,
  startDate: string,
  endDate: string,
  frequency: "weekly" | "biweekly" | "monthly",
  dayOfWeek: number,          // 0-6
  startTime: number,
  duration: number,
  seriesId: string            // Group related bookings
}

waitlist {
  userId: Id<"users">,
  courtId: Id<"courts">,
  requestedDate: string,
  requestedTime: number,
  priority: number,
  notified: boolean,
  createdAt: number
}

bookingGroups {
  name: string,               // "Company Event", "Tournament"
  userId: Id<"users">,
  bookingIds: Id<"bookings">[],
  totalPrice: number,
  createdAt: number
}
```

**Phase 3:**
```typescript
payments {
  bookingId: Id<"bookings">,
  userId: Id<"users">,
  amount: number,
  paymentMethod: "cash" | "card" | "bank_transfer" | "upi",
  status: "pending" | "completed" | "failed",
  transactionRef: string,
  paidAt: number,
  recordedBy: Id<"users">     // Staff who recorded payment
}

invoices {
  invoiceNumber: string,
  userId: Id<"users">,
  bookingIds: Id<"bookings">[],
  amount: number,
  tax: number,
  total: number,
  status: "draft" | "sent" | "paid",
  generatedAt: number,
  paidAt: number
}

refunds {
  bookingId: Id<"bookings">,
  paymentId: Id<"payments">,
  amount: number,
  reason: string,
  status: "pending" | "approved" | "processed",
  requestedAt: number,
  processedAt: number,
  processedBy: Id<"users">
}
```

**Phase 4:**
```typescript
teams {
  name: string,
  captainId: Id<"users">,
  description: string,
  logoUrl: string,
  createdAt: number
}

teamMembers {
  teamId: Id<"teams">,
  userId: Id<"users">,
  role: "captain" | "member",
  joinedAt: number
}

trainers {
  userId: Id<"users">,
  specializations: string[],  // ["Beginners", "Advanced", "Kids"]
  certifications: string[],
  hourlyRate: number,
  bio: string,
  availableSlots: object      // Weekly availability
}

coachingSessions {
  trainerId: Id<"trainers">,
  courtId: Id<"courts">,
  type: "private" | "group" | "assessment",
  date: string,
  startTime: number,
  duration: number,
  capacity: number,
  studentIds: Id<"users">[],
  notes: string
}

trainerReviews {
  trainerId: Id<"trainers">,
  studentId: Id<"users">,
  sessionId: Id<"coachingSessions">,
  rating: number,             // 1-5
  comment: string,
  createdAt: number
}
```

**Phase 5:**
```typescript
activityLogs {
  userId: Id<"users">,
  action: string,             // "booking_created", "payment_recorded"
  entityType: string,         // "bookings", "payments"
  entityId: string,
  details: object,
  ipAddress: string,
  timestamp: number
}

notifications {
  userId: Id<"users">,
  type: string,               // "booking_reminder", "payment_due"
  channel: "email" | "sms" | "push" | "whatsapp",
  subject: string,
  message: string,
  status: "pending" | "sent" | "failed",
  sentAt: number
}

locations {
  name: string,
  address: string,
  phone: string,
  email: string,
  managerIds: Id<"users">[]
}
```

### Frontend Architecture Updates

#### New Pages/Components Needed

**Phase 1:**
- `pages/Settings.tsx` - Arena settings management
- `components/pricing/PricingRules.tsx`
- `components/booking/TimeSlotPicker.tsx` - Enhanced version
- `components/courts/CourtDetails.tsx`

**Phase 2:**
- `pages/Memberships.tsx`
- `pages/MemberProfile.tsx`
- `components/booking/RecurringBookingForm.tsx`
- `components/booking/WaitlistManager.tsx`
- `components/booking/MultiCourtBooking.tsx`

**Phase 3:**
- `pages/Payments.tsx`
- `components/payments/PaymentRecorder.tsx`
- `components/payments/InvoiceGenerator.tsx`
- `components/payments/RefundManager.tsx`

**Phase 4:**
- `pages/Teams.tsx`
- `pages/TeamDetails.tsx`
- `pages/Trainers.tsx`
- `pages/CoachingSessions.tsx`
- `components/trainers/TrainerCalendar.tsx`

**Phase 5:**
- `pages/Reports.tsx`
- `pages/Analytics.tsx`
- `pages/SystemAdmin.tsx`
- `components/reports/ReportGenerator.tsx`
- `components/analytics/AnalyticsDashboard.tsx`

### Navigation Structure

```
Public Pages:
├── Landing Page (Hero, Features, Pricing, Contact)
└── Sign In / Sign Up

Authenticated User:
├── Dashboard
│   ├── My Bookings
│   ├── Book Court
│   └── My Profile
├── Memberships
│   ├── Current Membership
│   ├── Upgrade Options
│   └── Payment History
├── Teams (if member of any)
│   ├── My Teams
│   ├── Team Schedule
│   └── Team Messages
└── Coaching Sessions
    ├── Find Trainers
    ├── My Sessions
    └── Book Session

Admin:
├── Dashboard
│   ├── Overview & Stats
│   ├── Today's Schedule
│   └── Quick Actions
├── Bookings
│   ├── All Bookings
│   ├── Calendar View
│   └── Waitlist
├── Courts
│   ├── Manage Courts
│   ├── Court Schedule
│   └── Maintenance Log
├── Members
│   ├── All Members
│   ├── Membership Tiers
│   └── Guest Bookings
├── Payments
│   ├── Record Payment
│   ├── Pending Payments
│   ├── Payment History
│   └── Invoices & Refunds
├── Teams
│   ├── All Teams
│   ├── Leagues/Tournaments
│   └── Match Schedule
├── Trainers
│   ├── Manage Trainers
│   ├── Session Schedule
│   └── Performance Reviews
├── Reports
│   ├── Revenue Reports
│   ├── Utilization Reports
│   ├── Member Analytics
│   └── Custom Reports
└── Settings
    ├── Arena Settings
    ├── Operating Hours
    ├── Pricing Rules
    ├── System Config
    └── Activity Logs
```

## Next Steps

1. **Review & Approve** this overview and phased approach
2. **Start Phase 1** with operating hours and pricing tiers
3. **Iterate** based on feedback and requirements
4. **Test thoroughly** at each phase before moving forward
5. **Deploy incrementally** to get user feedback early

## Technology Stack Confirmation

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Convex (serverless, real-time)
- **Authentication**: Custom (already implemented)
- **Email**: Resend (already configured)
- **SMS** (Phase 5): Twilio or similar
- **Reports/PDF**: react-pdf or similar
- **Charts**: Recharts or Chart.js
- **Calendar**: react-big-calendar or FullCalendar

## Estimated Total Timeline

- **Phase 1**: 3-4 days
- **Phase 2**: 4-5 days
- **Phase 3**: 5-6 days
- **Phase 4**: 6-7 days
- **Phase 5**: 7-8 days

**Total**: ~25-30 days of focused development

This can be parallelized or adjusted based on priority and resources.
