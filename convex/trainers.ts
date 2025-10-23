import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// PHASE 4: Trainers Management

export const list = query({
  args: {},
  handler: async (ctx) => {
    const trainers = await ctx.db
      .query("trainers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return await Promise.all(
      trainers.map(async (trainer) => {
        const user = await ctx.db.get(trainer.userId);
        return {
          ...trainer,
          name: user?.name || "Unknown",
          email: user?.email || "",
          specialization: trainer.specializations?.[0] || "Badminton Coach",
        };
      })
    );
  },
});

export const getById = query({
  args: { trainerId: v.id("trainers") },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return null;

    const user = await ctx.db.get(trainer.userId);

    // Get recent reviews
    const reviews = await ctx.db
      .query("trainerReviews")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .order("desc")
      .take(10);

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const student = await ctx.db.get(review.studentId);
        return {
          ...review,
          student,
        };
      })
    );

    return {
      ...trainer,
      user,
      reviews: reviewsWithUsers,
    };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    specializations: v.array(v.string()),
    certifications: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...trainerData } = args;

    // Check if trainer profile already exists
    const existing = await ctx.db
      .query("trainers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new Error("Trainer profile already exists");
    }

    // Update user role to trainer
    await ctx.db.patch(userId, { role: "trainer" });

    return await ctx.db.insert("trainers", {
      ...trainerData,
      userId,
      isActive: true,
      rating: 0,
      totalReviews: 0,
    });
  },
});

export const update = mutation({
  args: {
    trainerId: v.id("trainers"),
    userId: v.id("users"),
    specializations: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    availability: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Check authorization
    if (trainer.userId !== args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
    }

    const { trainerId, userId, ...updates } = args;
    await ctx.db.patch(trainerId, updates);
  },
});

// Coaching Sessions

export const createSession = mutation({
  args: {
    trainerId: v.id("trainers"),
    courtId: v.id("courts"),
    type: v.union(v.literal("private"), v.literal("group"), v.literal("assessment")),
    date: v.string(),
    startTime: v.number(),
    duration: v.number(),
    capacity: v.number(),
    price: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("coachingSessions", {
      ...args,
      studentIds: [],
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});

export const listSessions = query({
  args: {
    trainerId: v.optional(v.id("trainers")),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sessions;

    if (args.trainerId) {
      const trainerId = args.trainerId; // Type narrowing
      sessions = await ctx.db
        .query("coachingSessions")
        .withIndex("by_trainer", (q) => q.eq("trainerId", trainerId))
        .collect();
    } else {
      sessions = await ctx.db.query("coachingSessions").collect();
    }

    if (args.date) {
      sessions = sessions.filter((s) => s.date === args.date);
    }

    return await Promise.all(
      sessions.map(async (session) => {
        const trainer = await ctx.db.get(session.trainerId);
        const trainerUser = trainer ? await ctx.db.get(trainer.userId) : null;
        const court = await ctx.db.get(session.courtId);

        return {
          ...session,
          trainer: trainerUser,
          court,
        };
      })
    );
  },
});

export const getUserSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allSessions = await ctx.db.query("coachingSessions").collect();

    const userSessions = allSessions.filter((session) =>
      session.studentIds.includes(args.userId)
    );

    return await Promise.all(
      userSessions.map(async (session) => {
        const trainer = await ctx.db.get(session.trainerId);
        const trainerUser = trainer ? await ctx.db.get(trainer.userId) : null;
        const court = await ctx.db.get(session.courtId);

        return {
          ...session,
          trainer: trainerUser,
          court,
        };
      })
    );
  },
});

export const bookSession = mutation({
  args: {
    sessionId: v.id("coachingSessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.studentIds.includes(args.userId)) {
      throw new Error("Already booked");
    }

    if (session.studentIds.length >= session.capacity) {
      throw new Error("Session is full");
    }

    await ctx.db.patch(args.sessionId, {
      studentIds: [...session.studentIds, args.userId],
    });
  },
});

export const cancelSessionBooking = mutation({
  args: {
    sessionId: v.id("coachingSessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.studentIds.includes(args.userId)) {
      throw new Error("Not booked");
    }

    await ctx.db.patch(args.sessionId, {
      studentIds: session.studentIds.filter((id) => id !== args.userId),
    });
  },
});

export const addReview = mutation({
  args: {
    trainerId: v.id("trainers"),
    studentId: v.id("users"),
    sessionId: v.optional(v.id("coachingSessions")),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const reviewId = await ctx.db.insert("trainerReviews", {
      ...args,
      createdAt: Date.now(),
    });

    // Update trainer's average rating
    const trainer = await ctx.db.get(args.trainerId);
    if (trainer) {
      const totalReviews = (trainer.totalReviews || 0) + 1;
      const currentTotal = (trainer.rating || 0) * (trainer.totalReviews || 0);
      const newRating = (currentTotal + args.rating) / totalReviews;

      await ctx.db.patch(args.trainerId, {
        rating: newRating,
        totalReviews,
      });
    }

    return reviewId;
  },
});
