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

// PHASE 1: Pricing Rules Management

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pricingRules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pricingRules").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    daysOfWeek: v.array(v.number()),
    pricePerHour: v.number(),
    courtIds: v.optional(v.array(v.id("courts"))),
    priority: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    const { userId, ...ruleData } = args;

    return await ctx.db.insert("pricingRules", {
      ...ruleData,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    ruleId: v.id("pricingRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.number())),
    pricePerHour: v.optional(v.number()),
    courtIds: v.optional(v.array(v.id("courts"))),
    priority: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    const { userId, ruleId, ...updates } = args;

    await ctx.db.patch(ruleId, updates);
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    ruleId: v.id("pricingRules"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    await ctx.db.delete(args.ruleId);
  },
});

// Calculate price for a booking
export const calculatePrice = query({
  args: {
    courtId: v.id("courts"),
    date: v.string(), // YYYY-MM-DD
    startTime: v.number(),
    duration: v.number(), // minutes
  },
  handler: async (ctx, args) => {
    const dayOfWeek = new Date(args.date).getDay();

    // Get all applicable pricing rules
    const allRules = await ctx.db
      .query("pricingRules")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter rules that apply to this booking
    const applicableRules = allRules.filter(rule => {
      // Check if day of week matches
      if (!rule.daysOfWeek.includes(dayOfWeek)) return false;

      // Check if court applies (empty courtIds means all courts)
      if (rule.courtIds && rule.courtIds.length > 0) {
        if (!rule.courtIds.includes(args.courtId)) return false;
      }

      // Check if time falls within rule's time range
      const bookingHour = args.startTime;
      const ruleStartHour = parseInt(rule.startTime.split(":")[0]);
      const ruleEndHour = parseInt(rule.endTime.split(":")[0]);

      if (bookingHour < ruleStartHour || bookingHour >= ruleEndHour) return false;

      return true;
    });

    // Sort by priority (highest first)
    applicableRules.sort((a, b) => b.priority - a.priority);

    // Use highest priority rule or default price
    const pricePerHour = applicableRules.length > 0
      ? applicableRules[0].pricePerHour
      : 500; // Default price

    const hours = args.duration / 60;
    const totalPrice = pricePerHour * hours;

    return {
      pricePerHour,
      duration: args.duration,
      totalPrice,
      appliedRule: applicableRules[0]?._id,
    };
  },
});
