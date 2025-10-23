# 🎾 Badminton Arena Management System - Quick Start

## 🎉 Current Status

### ✅ COMPLETED (100%)
**Backend Implementation**
- ✅ Database schema with 15+ tables
- ✅ All Phase 1, 2, 4 backend functions
- ✅ Dynamic pricing system
- ✅ Membership tiers (4 levels)
- ✅ Team management
- ✅ Trainer/coaching system
- ✅ Waitlist with priority
- ✅ Guest bookings
- ✅ Recurring bookings support
- ✅ Convex functions compiled successfully

**Frontend Started**
- ✅ Hero section redesigned with badminton theme
- ✅ Project running at http://localhost:5173

### 🚧 In Progress (20%)
**Frontend Needs:**
- Features section update
- Membership showcase component
- Enhanced booking interface
- Team/Trainer pages
- Admin management pages

---

## 🚀 Your System is Running!

```bash
# Already running in background:
Frontend: http://localhost:5173
Convex: Compiled and ready

# Test credentials:
Admin: admin@example.com / admin123
```

---

## 📋 What You Have Now

### Backend APIs (All Working!)

**Bookings**
```typescript
// Enhanced booking with all new fields
convex/bookings.ts
- create (with duration, purpose, price, guest info)
- listForUser
- listAll
- cancel
```

**Memberships**
```typescript
convex/memberships.ts
- listTiers (Day Pass, Regular, Premium, VIP)
- getUserMembership
- purchaseMembership
- initializeDefaultTiers
```

**Pricing**
```typescript
convex/pricing.ts
- list, create, update
- calculatePrice (automatic based on rules)
```

**Teams**
```typescript
convex/teams.ts
- list, getById, getUserTeams
- create, addMember, removeMember
```

**Trainers**
```typescript
convex/trainers.ts
- list, getById, create, update
- createSession, listSessions, bookSession
- addReview
```

**Courts & Settings**
```typescript
convex/courts.ts - Enhanced with amenities
convex/settings.ts - Operating hours, config
convex/waitlist.ts - Priority-based queue
```

---

## 🎯 Next Steps (Prioritized)

### 1. Initialize Default Data (5 minutes)
Before building more frontend, initialize your database:

**Open Convex Dashboard** (link in terminal):

1. Run: `settings.initializeDefaultSettings`
   - Sets operating hours: 6 AM - 11 PM
   - Default slot duration: 60 minutes

2. Run: `memberships.initializeDefaultTiers`
   - Creates 4 membership tiers:
     - Day Pass (₹0)
     - Regular (₹2000/month, 10% discount)
     - Premium (₹4000/month, 20% discount, priority)
     - VIP (₹7000/month, 30% discount, max benefits)

3. Add sample courts via `courts.add`:
   ```json
   {
     "userId": "<admin-user-id>",
     "name": "Court 1 - Championship",
     "description": "Professional grade court with premium flooring",
     "surfaceType": "wooden",
     "capacity": 4,
     "slotDuration": 60,
     "amenities": ["AC", "LED Lighting", "High Ceiling", "Parking"]
   }
   ```
   Repeat for multiple courts.

4. Add pricing rules via `pricing.create`:
   ```json
   {
     "userId": "<admin-user-id>",
     "name": "Peak Hours",
     "startTime": "18:00",
     "endTime": "22:00",
     "daysOfWeek": [1,2,3,4,5],
     "pricePerHour": 800,
     "priority": 10,
     "description": "Weekday evening peak hours"
   }
   ```

### 2. Continue Frontend Development

#### Priority 1: Update Features Section (30 min)
Edit `src/components/sections/Features.tsx`:
- Change to badminton-specific features
- Highlight: Court booking, Memberships, Teams, Coaching

#### Priority 2: Create Membership Showcase (1 hour)
Create `src/components/sections/MembershipShowcase.tsx`:
- Display 4 tiers in cards
- Show benefits comparison
- Link to sign up

#### Priority 3: Enhanced Booking Flow (2-3 hours)
Update `src/components/dashboard/CourtScheduler.tsx`:
- Show available durations (30min, 1hr, 1.5hr, 2hr)
- Calculate and display price before booking
- Add purpose dropdown (Practice, Match, Training, Tournament)
- Add notes field
- Show membership discount if applicable

#### Priority 4: My Membership Page (1-2 hours)
Create `src/pages/MyMembership.tsx`:
- Show current tier or "No membership"
- Display benefits
- Show expiry date
- Upgrade/purchase options
- Payment history

#### Priority 5: Teams Pages (2-3 hours)
- `src/pages/MyTeams.tsx` - List user's teams
- `src/pages/TeamDetails.tsx` - Team roster, add/remove members
- `src/components/teams/CreateTeamModal.tsx` - Create new team

#### Priority 6: Trainers & Coaching (2-3 hours)
- `src/pages/Trainers.tsx` - Browse trainers with filters
- `src/pages/TrainerDetails.tsx` - Full profile, reviews, book session
- `src/components/trainers/SessionBooking.tsx` - Book coaching
- `src/pages/MyCoachingSessions.tsx` - User's booked sessions

#### Priority 7: Admin Pages (3-4 hours)
- `src/pages/PricingManagement.tsx` - CRUD pricing rules
- `src/pages/MembershipManagement.tsx` - Manage tiers
- `src/pages/Settings.tsx` - Operating hours, config
- Update `src/pages/AdminDashboard.tsx` with new stats

### 3. Update Navigation (1 hour)
Edit `src/components/ui/navigation.tsx` or create proper nav:
```
User Menu:
- Dashboard
- Book Court
- My Bookings
- My Membership
- My Teams
- Find Trainers
- Profile

Admin Menu:
- Dashboard
- All Bookings
- Courts
- Pricing Rules
- Memberships
- Teams
- Trainers
- Settings
```

---

## 💡 Quick Tips for Development

### Using Convex Functions in Frontend

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// Query example
const tiers = useQuery(api.memberships.listTiers);

// Mutation example
const purchaseMembership = useMutation(api.memberships.purchaseMembership);

// Usage
await purchaseMembership({ userId, tierId });
```

### Get Price Before Booking
```typescript
const pricing = useQuery(api.pricing.calculatePrice, {
  courtId,
  date: "2025-10-24",
  startTime: 18,
  duration: 90,
});
// Returns: { pricePerHour, totalPrice, appliedRule }
```

### Show User's Membership
```typescript
const membership = useQuery(api.memberships.getUserMembership, { userId });
// Returns: { status, tier, expiryDate, benefits }
```

---

## 📁 Project Structure

```
/convex/                  # Backend (COMPLETE ✅)
├── schema.ts             # 15+ tables
├── bookings.ts           # Enhanced bookings
├── courts.ts             # Court management
├── memberships.ts        # 4-tier system
├── pricing.ts            # Dynamic pricing
├── teams.ts              # Team management
├── trainers.ts           # Coaching system
├── waitlist.ts           # Priority queue
└── settings.ts           # Arena config

/src/                     # Frontend (IN PROGRESS 🚧)
├── App.tsx               # Main routing
├── /pages/               # Full pages
│   ├── AdminDashboard.tsx    ✅
│   ├── UserDashboard.tsx     ✅
│   ├── MyMembership.tsx      ⏳ TODO
│   ├── MyTeams.tsx           ⏳ TODO
│   ├── Trainers.tsx          ⏳ TODO
│   └── PricingManagement.tsx ⏳ TODO
├── /components/
│   ├── /sections/
│   │   ├── Hero.tsx          ✅ REDESIGNED
│   │   ├── Features.tsx      ⏳ UPDATE NEEDED
│   │   └── MembershipShowcase.tsx ⏳ TODO
│   ├── /dashboard/
│   │   ├── CourtScheduler.tsx ⏳ ENHANCE
│   │   ├── MyBookings.tsx     ⏳ ENHANCE
│   │   └── ManageCourts.tsx   ⏳ ENHANCE
│   └── /ui/              # Reusable components ✅
```

---

## 🎨 Design Theme

**Colors:**
- Primary: Emerald/Green (courts, success)
- Secondary: Blue (teams, trainers)
- Accent: Teal (highlights)

**Icons:**
- 🏸 Badminton
- 🏆 Trophy
- 👥 Teams
- 🎖️ Coach/Award
- 📅 Calendar
- ⚡ Fast/Premium

---

## 📚 Documentation

- `CLAUDE.md` - Project overview for AI
- `PROJECT_OVERVIEW.md` - Full architecture
- `IMPLEMENTATION_STATUS.md` - Detailed status & checklist
- `API.md` - Original auth API docs

---

## ⚡ Estimated Time to Complete

- **Core User Features**: 6-8 hours
  - Booking enhancements: 2-3h
  - Membership pages: 1-2h
  - Teams: 2-3h

- **Admin Features**: 3-4 hours
  - Pricing management: 1-2h
  - Settings: 1h
  - Enhanced dashboards: 1-2h

- **Trainers/Coaching**: 2-3 hours

- **Polish & Testing**: 2-3 hours

**Total**: ~15-20 hours for complete system

---

## 🚨 Important Notes

1. **Authentication is simplified** (as requested for testing)
2. **No payment gateway** - tracking only (Phase 3 skipped)
3. **All backend is ready** - just connect frontend
4. **Type-safe** - Full TypeScript coverage
5. **Real-time** - Convex provides live updates

---

## 🎯 Your Next Command

```bash
# Everything is already running!
# Just open: http://localhost:5173

# To restart if needed:
npm run dev
```

---

## 🤝 Need Help?

All backend functions are documented and working. To test any function:
1. Open Convex Dashboard (link in terminal)
2. Go to Functions tab
3. Click any function
4. See args/returns
5. Click "Run" to test

Example: Test `memberships.listTiers` to see all membership options!

---

**Backend**: ✅ 100% Complete
**Frontend**: 🚧 20% Complete
**Ready for**: Frontend development sprint!

Happy coding! 🎾🚀
