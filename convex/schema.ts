import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.optional(v.string()), // "admin", "user", "trainer"
    emailVerified: v.optional(v.boolean()),
    twoFactorEnabled: v.optional(v.boolean()),
    // Enhanced profile fields (Phase 2)
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    profilePhoto: v.optional(v.string()),
    preferences: v.optional(v.object({
      favoriteCourtIds: v.optional(v.array(v.string())),
      preferredTimes: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_verified", ["emailVerified"])
    .index("by_role", ["role"]),

  emailLogs: defineTable({
    to: v.string(),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    sentAt: v.number(),
    userId: v.optional(v.id("users")),
    type: v.string(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  otpCodes: defineTable({
    userId: v.optional(v.id("users")),
    email: v.string(),
    code: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("password_reset"),
      v.literal("login_2fa")
    ),
    expiresAt: v.number(),
    used: v.boolean(),
    attempts: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email_and_type", ["email", "type"])
    .index("by_expires", ["expiresAt"])
    .index("by_user", ["userId"]),

  // Badminton Arena Management Tables

  // PHASE 1: Enhanced Courts
  courts: defineTable({
    name: v.string(),
    status: v.union(v.literal("open"), v.literal("maintenance")),
    description: v.optional(v.string()),
    surfaceType: v.optional(v.string()), // "wooden", "synthetic", "concrete"
    capacity: v.optional(v.number()), // max players
    slotDuration: v.optional(v.number()), // minutes (default 60)
    imageUrl: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())), // ["AC", "Lighting", "Parking"]
    openHours: v.optional(v.object({
      start: v.number(), // e.g., 6 for 6 AM
      end: v.number(),   // e.g., 22 for 10 PM
    })),
    // Pricing
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    weeklyRate: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
  }),

  // PHASE 1: Arena Settings
  arenaSettings: defineTable({
    settingKey: v.string(), // "operating_hours", "default_slot_duration"
    settingValue: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["settingKey"]),

  // PHASE 1: Pricing Rules
  pricingRules: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(), // "06:00"
    endTime: v.string(), // "10:00"
    daysOfWeek: v.array(v.number()), // [0,1,2,3,4,5,6] 0=Sunday
    pricePerHour: v.number(),
    courtIds: v.optional(v.array(v.id("courts"))), // Specific courts or all if empty
    priority: v.number(), // Higher priority rules override lower ones
    isActive: v.boolean(),
  }),

  // PHASE 1: Enhanced Bookings
  bookings: defineTable({
    userId: v.id("users"),
    courtId: v.id("courts"),
    bookingDate: v.string(), // YYYY-MM-DD
    startTime: v.number(), // Hour of the day (0-23)
    endTime: v.number(), // Hour of the day (1-24)
    duration: v.optional(v.number()), // minutes
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
    // Phase 1 enhancements
    purpose: v.optional(v.string()), // "practice", "match", "training", "tournament"
    notes: v.optional(v.string()),
    price: v.optional(v.number()),
    // Team booking
    isTeamBooking: v.optional(v.boolean()),
    teamSize: v.optional(v.number()),
    teamName: v.optional(v.string()),
    // Phase 2 enhancements
    isRecurring: v.optional(v.boolean()),
    recurringSeriesId: v.optional(v.string()),
    recurringPattern: v.optional(v.union(v.literal("weekly"), v.literal("monthly"))),
    recurringEndDate: v.optional(v.string()), // YYYY-MM-DD
    isGuest: v.optional(v.boolean()),
    guestName: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_court_and_date", ["courtId", "bookingDate"])
    .index("by_series", ["recurringSeriesId"])
    .index("by_date", ["bookingDate"]),

  // PHASE 2: Membership Tiers
  membershipTiers: defineTable({
    name: v.string(), // "Regular", "Premium", "VIP"
    description: v.string(),
    price: v.number(),
    durationDays: v.number(),
    benefits: v.object({
      discountPercent: v.optional(v.number()),
      priorityBooking: v.optional(v.boolean()),
      advanceBookingDays: v.optional(v.number()),
      freeCourtHours: v.optional(v.number()),
    }),
    isActive: v.boolean(),
    displayOrder: v.number(),
  }),

  // PHASE 2: User Memberships
  memberships: defineTable({
    userId: v.id("users"),
    tierId: v.id("membershipTiers"),
    startDate: v.number(),
    expiryDate: v.number(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("cancelled")),
    autoRenew: v.optional(v.boolean()),
    purchasedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // PHASE 2: Recurring Bookings
  recurringBookings: defineTable({
    userId: v.id("users"),
    courtId: v.id("courts"),
    seriesId: v.string(), // Group ID for all bookings in series
    startDate: v.string(),
    endDate: v.optional(v.string()),
    frequency: v.union(v.literal("weekly"), v.literal("biweekly"), v.literal("monthly")),
    dayOfWeek: v.number(), // 0-6
    startTime: v.number(),
    duration: v.number(),
    purpose: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_series", ["seriesId"]),

  // PHASE 2: Waitlist
  waitlist: defineTable({
    userId: v.id("users"),
    courtId: v.id("courts"),
    requestedDate: v.string(),
    requestedTime: v.number(),
    duration: v.optional(v.number()),
    priority: v.number(), // Based on membership tier
    status: v.union(v.literal("waiting"), v.literal("notified"), v.literal("fulfilled"), v.literal("expired")),
    notifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_court_and_date", ["courtId", "requestedDate"])
    .index("by_status", ["status"]),

  // PHASE 4: Teams
  teams: defineTable({
    name: v.string(),
    captainId: v.id("users"),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_captain", ["captainId"]),

  // PHASE 4: Team Members
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("captain"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"]),

  // PHASE 4: Trainers (extends user with trainer-specific info)
  trainers: defineTable({
    userId: v.id("users"),
    specializations: v.array(v.string()), // ["Beginners", "Advanced", "Kids", "Competition"]
    certifications: v.optional(v.array(v.string())),
    experience: v.optional(v.string()), // "5 years"
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    availability: v.optional(v.object({
      monday: v.optional(v.array(v.string())),
      tuesday: v.optional(v.array(v.string())),
      wednesday: v.optional(v.array(v.string())),
      thursday: v.optional(v.array(v.string())),
      friday: v.optional(v.array(v.string())),
      saturday: v.optional(v.array(v.string())),
      sunday: v.optional(v.array(v.string())),
    })),
    isActive: v.boolean(),
    rating: v.optional(v.number()), // Average rating
    totalReviews: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  // PHASE 4: Coaching Sessions
  coachingSessions: defineTable({
    trainerId: v.id("trainers"),
    courtId: v.id("courts"),
    type: v.union(v.literal("private"), v.literal("group"), v.literal("assessment")),
    date: v.string(),
    startTime: v.number(),
    duration: v.number(),
    capacity: v.number(), // Max students
    studentIds: v.array(v.id("users")),
    price: v.optional(v.number()),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_court", ["courtId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"]),

  // PHASE 4: Trainer Reviews
  trainerReviews: defineTable({
    trainerId: v.id("trainers"),
    studentId: v.id("users"),
    sessionId: v.optional(v.id("coachingSessions")),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_trainer", ["trainerId"])
    .index("by_student", ["studentId"]),

  // PHASE 5: League Management
  leagues: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    format: v.union(v.literal("single_elimination"), v.literal("round_robin"), v.literal("double_elimination")),
    status: v.union(v.literal("upcoming"), v.literal("ongoing"), v.literal("completed")),
    maxTeams: v.optional(v.number()),
    entryFee: v.optional(v.number()),
    prizePool: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  leagueParticipants: defineTable({
    leagueId: v.id("leagues"),
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")), // For individual participation
    registeredAt: v.number(),
    status: v.union(v.literal("registered"), v.literal("confirmed"), v.literal("withdrawn")),
  })
    .index("by_league", ["leagueId"])
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"]),

  leagueMatches: defineTable({
    leagueId: v.id("leagues"),
    round: v.number(),
    matchNumber: v.number(),
    team1Id: v.optional(v.id("leagueParticipants")),
    team2Id: v.optional(v.id("leagueParticipants")),
    courtId: v.optional(v.id("courts")),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.number()),
    winnerId: v.optional(v.id("leagueParticipants")),
    score: v.optional(v.string()), // "21-19, 21-15"
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
  })
    .index("by_league", ["leagueId"])
    .index("by_court", ["courtId"]),

  // PHASE 5: Student Progress Tracking
  studentAttendance: defineTable({
    studentId: v.id("users"),
    sessionId: v.id("coachingSessions"),
    attended: v.boolean(),
    arrivalTime: v.optional(v.number()),
    notes: v.optional(v.string()),
    markedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_session", ["sessionId"]),

  studentProgress: defineTable({
    studentId: v.id("users"),
    trainerId: v.id("trainers"),
    skillArea: v.string(), // "Serve", "Smash", "Footwork", etc.
    level: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    notes: v.optional(v.string()),
    assessedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_trainer", ["trainerId"]),
});
