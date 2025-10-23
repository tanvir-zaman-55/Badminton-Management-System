import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// PHASE 4: Teams Management

export const list = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return await Promise.all(
      teams.map(async (team) => {
        const captain = await ctx.db.get(team.captainId);
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        return {
          ...team,
          captain,
          memberCount: members.length,
        };
      })
    );
  },
});

export const getById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const captain = await ctx.db.get(team.captainId);
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const members = await Promise.all(
      teamMembers.map(async (tm) => {
        const user = await ctx.db.get(tm.userId);
        return {
          ...tm,
          user,
        };
      })
    );

    return {
      ...team,
      captain,
      members,
    };
  },
});

export const getUserTeams = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const teamMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      teamMemberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        const captain = team ? await ctx.db.get(team.captainId) : null;
        return {
          ...team,
          captain,
          userRole: membership.role,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    maxMembers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...teamData } = args;

    const teamId = await ctx.db.insert("teams", {
      ...teamData,
      captainId: userId,
      isActive: true,
      createdAt: Date.now(),
    });

    // Add creator as captain
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "captain",
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    requesterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if requester is captain
    if (team.captainId !== args.requesterId) {
      throw new Error("Only team captain can add members");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMembership) {
      throw new Error("User is already a team member");
    }

    // Check max members
    if (team.maxMembers) {
      const currentMembers = await ctx.db
        .query("teamMembers")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .collect();

      if (currentMembers.length >= team.maxMembers) {
        throw new Error("Team is full");
      }
    }

    return await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    requesterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if requester is captain or removing themselves
    if (team.captainId !== args.requesterId && args.userId !== args.requesterId) {
      throw new Error("Unauthorized");
    }

    // Cannot remove captain
    if (args.userId === team.captainId) {
      throw new Error("Cannot remove team captain");
    }

    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!membership) {
      throw new Error("User is not a team member");
    }

    await ctx.db.delete(membership._id);
  },
});

// Join a team (public join)
export const join = mutation({
  args: {
    userId: v.id("users"),
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const { userId, teamId } = args;

    const team = await ctx.db.get(teamId);
    if (!team || !team.isActive) {
      throw new Error("Team not found or inactive");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingMembership) {
      throw new Error("You are already a member of this team");
    }

    // Check team capacity
    const currentMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    if (team.maxMembers && currentMembers.length >= team.maxMembers) {
      throw new Error("Team is full");
    }

    // Add member
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });

    return { success: true };
  },
});
