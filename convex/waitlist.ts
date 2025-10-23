import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// PHASE 2: Waitlist Management

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    status: v.optional(v.union(v.literal("waiting"), v.literal("notified"), v.literal("fulfilled"), v.literal("expired"))),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.userId) {
      const userId = args.userId; // Type narrowing
      results = await ctx.db
        .query("waitlist")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    } else {
      results = await ctx.db.query("waitlist").collect();
    }

    if (args.status) {
      results = results.filter((w) => w.status === args.status);
    }

    return await Promise.all(
      results.map(async (item) => {
        const user = await ctx.db.get(item.userId);
        const court = await ctx.db.get(item.courtId);
        return {
          ...item,
          user,
          court,
        };
      })
    );
  },
});

export const join = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
    requestedDate: v.string(),
    requestedTime: v.number(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if already in waitlist for this slot
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("courtId"), args.courtId))
      .filter((q) => q.eq(q.field("requestedDate"), args.requestedDate))
      .filter((q) => q.eq(q.field("requestedTime"), args.requestedTime))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .first();

    if (existing) {
      throw new Error("Already in waitlist for this slot");
    }

    // Get user's membership to determine priority
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    let priority = 1; // Default priority
    if (membership) {
      const tier = await ctx.db.get(membership.tierId);
      // Higher tier = higher priority (VIP=4, Premium=3, Regular=2, Day Pass=1)
      if (tier?.name === "VIP") priority = 4;
      else if (tier?.name === "Premium") priority = 3;
      else if (tier?.name === "Regular") priority = 2;
    }

    return await ctx.db.insert("waitlist", {
      ...args,
      priority,
      status: "waiting",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    waitlistId: v.id("waitlist"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.waitlistId);
    if (!item) {
      throw new Error("Waitlist item not found");
    }

    if (item.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.waitlistId);
  },
});

export const notifyNext = mutation({
  args: {
    courtId: v.id("courts"),
    date: v.string(),
    time: v.number(),
  },
  handler: async (ctx, args) => {
    // Find highest priority waiting user for this slot
    const waitingUsers = await ctx.db
      .query("waitlist")
      .withIndex("by_court_and_date", (q) =>
        q.eq("courtId", args.courtId).eq("requestedDate", args.date)
      )
      .filter((q) => q.eq(q.field("requestedTime"), args.time))
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .collect();

    if (waitingUsers.length === 0) {
      return null;
    }

    // Sort by priority (highest first), then by createdAt (earliest first)
    waitingUsers.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });

    const nextUser = waitingUsers[0];

    // Mark as notified
    await ctx.db.patch(nextUser._id, {
      status: "notified",
      notifiedAt: Date.now(),
    });

    // TODO: Send notification to user (email/SMS)

    return nextUser;
  },
});
