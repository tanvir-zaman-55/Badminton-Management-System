import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to check for admin role
const assertAdmin = async (ctx: any, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("User is not an admin.");
  }
};

// PHASE 2: Membership Tiers Management

export const listTiers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("membershipTiers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const createTier = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    durationDays: v.number(),
    discountPercent: v.optional(v.number()),
    priorityBooking: v.optional(v.boolean()),
    advanceBookingDays: v.optional(v.number()),
    freeCourtHours: v.optional(v.number()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    const { userId, discountPercent, priorityBooking, advanceBookingDays, freeCourtHours, ...tierData } = args;

    return await ctx.db.insert("membershipTiers", {
      ...tierData,
      benefits: {
        discountPercent,
        priorityBooking,
        advanceBookingDays,
        freeCourtHours,
      },
      isActive: true,
    });
  },
});

// User Memberships

export const getUserMembership = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!membership) return null;

    const tier = await ctx.db.get(membership.tierId);

    return {
      ...membership,
      tier,
    };
  },
});

export const purchaseMembership = mutation({
  args: {
    userId: v.id("users"),
    tierId: v.id("membershipTiers"),
  },
  handler: async (ctx, args) => {
    const tier = await ctx.db.get(args.tierId);
    if (!tier) {
      throw new Error("Membership tier not found");
    }

    // Check if user already has an active membership
    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existingMembership) {
      // Cancel existing membership
      await ctx.db.patch(existingMembership._id, { status: "cancelled" });
    }

    const now = Date.now();
    const expiryDate = now + (tier.durationDays * 24 * 60 * 60 * 1000);

    return await ctx.db.insert("memberships", {
      userId: args.userId,
      tierId: args.tierId,
      startDate: now,
      expiryDate,
      status: "active",
      autoRenew: false,
      purchasedAt: now,
    });
  },
});

export const cancelMembership = mutation({
  args: {
    userId: v.id("users"),
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Membership not found");
    }

    if (membership.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.membershipId, { status: "cancelled" });
  },
});

// Initialize default membership tiers - can be called by any user
export const initializeDefaultTiers = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if tiers already exist
    const existingTiers = await ctx.db.query("membershipTiers").first();
    if (existingTiers) {
      throw new Error("Membership tiers already exist");
    }

    const defaultTiers = [
      {
        name: "Day Pass",
        description: "Pay as you go - No commitment",
        price: 0,
        durationDays: 1,
        benefits: {
          discountPercent: 0,
          priorityBooking: false,
          advanceBookingDays: 7,
          freeCourtHours: 0,
        },
        displayOrder: 1,
      },
      {
        name: "Regular",
        description: "Monthly membership with 10% discount",
        price: 2000,
        durationDays: 30,
        benefits: {
          discountPercent: 10,
          priorityBooking: false,
          advanceBookingDays: 14,
          freeCourtHours: 2,
        },
        displayOrder: 2,
      },
      {
        name: "Premium",
        description: "Premium membership with priority booking and 20% discount",
        price: 4000,
        durationDays: 30,
        benefits: {
          discountPercent: 20,
          priorityBooking: true,
          advanceBookingDays: 30,
          freeCourtHours: 5,
        },
        displayOrder: 3,
      },
      {
        name: "VIP",
        description: "VIP membership with all benefits",
        price: 7000,
        durationDays: 30,
        benefits: {
          discountPercent: 30,
          priorityBooking: true,
          advanceBookingDays: 60,
          freeCourtHours: 10,
        },
        displayOrder: 4,
      },
    ];

    for (const tier of defaultTiers) {
      await ctx.db.insert("membershipTiers", {
        ...tier,
        isActive: true,
      });
    }

    return { success: true };
  },
});
