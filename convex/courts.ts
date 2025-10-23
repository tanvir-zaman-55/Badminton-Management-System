import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Helper to check for admin role
const assertAdmin = async (ctx: any, userId: any) => {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("User is not an admin.");
  }
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courts").order("asc").collect();
  },
});

export const add = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    surfaceType: v.optional(v.string()),
    capacity: v.optional(v.number()),
    slotDuration: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    openHours: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    weeklyRate: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    const { userId, ...courtData } = args;
    return await ctx.db.insert("courts", {
      ...courtData,
      status: "open",
    });
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("open"), v.literal("maintenance"))),
    openHours: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    weeklyRate: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    const { userId, courtId, ...updateData } = args;
    await ctx.db.patch(courtId, updateData);
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
    status: v.union(v.literal("open"), v.literal("maintenance")),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);
    await ctx.db.patch(args.courtId, { status: args.status });
  },
});

export const deleteCourt = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);

    // Check if there are any future bookings for this court
    const futureBookings = await ctx.db
      .query("bookings")
      .withIndex("by_court_and_date", (q) => q.eq("courtId", args.courtId))
      .filter((q) => q.gte(q.field("bookingDate"), new Date().toISOString().split('T')[0]))
      .collect();

    if (futureBookings.length > 0) {
      throw new Error("Cannot delete court with future bookings. Please cancel all bookings first.");
    }

    await ctx.db.delete(args.courtId);
  },
});
