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

// PHASE 1: Arena Settings Management

export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("arenaSettings")
      .withIndex("by_key", (q) => q.eq("settingKey", args.key))
      .first();
    return setting;
  },
});

export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("arenaSettings").collect();
  },
});

export const updateSetting = mutation({
  args: {
    userId: v.id("users"),
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);

    const existing = await ctx.db
      .query("arenaSettings")
      .withIndex("by_key", (q) => q.eq("settingKey", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        settingValue: args.value,
        updatedAt: Date.now(),
        updatedBy: args.userId,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("arenaSettings", {
        settingKey: args.key,
        settingValue: args.value,
        updatedAt: Date.now(),
        updatedBy: args.userId,
      });
    }
  },
});

// Initialize default settings
export const initializeDefaultSettings = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx, args.userId);

    const defaults = [
      {
        key: "operating_hours",
        value: {
          weekday: { open: "06:00", close: "23:00" },
          weekend: { open: "06:00", close: "23:00" },
        },
      },
      {
        key: "default_slot_duration",
        value: 60, // minutes
      },
      {
        key: "advance_booking_days",
        value: 30,
      },
      {
        key: "cancellation_hours",
        value: 2, // must cancel 2 hours before
      },
    ];

    for (const setting of defaults) {
      const existing = await ctx.db
        .query("arenaSettings")
        .withIndex("by_key", (q) => q.eq("settingKey", setting.key))
        .first();

      if (!existing) {
        await ctx.db.insert("arenaSettings", {
          settingKey: setting.key,
          settingValue: setting.value,
          updatedAt: Date.now(),
          updatedBy: args.userId,
        });
      }
    }

    return { success: true };
  },
});
