import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get all bookings for a specific date to show on the calendar
export const getBookingsForDate = query({
  args: {
    bookingDate: v.string(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("bookingDate"), args.bookingDate))
      .collect();
    return bookings.filter((booking) => booking.status === "confirmed");
  },
});

// Create a new booking
export const create = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
    bookingDate: v.string(),
    startTime: v.number(),
    duration: v.optional(v.number()), // in minutes
    purpose: v.optional(v.string()),
    notes: v.optional(v.string()),
    isGuest: v.optional(v.boolean()),
    guestName: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    isTeamBooking: v.optional(v.boolean()),
    teamSize: v.optional(v.number()),
    teamName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, courtId, bookingDate, startTime, duration = 60, purpose, notes, isGuest, guestName, guestPhone } = args;

    // Get court to check slot duration
    const court = await ctx.db.get(courtId);
    if (!court) {
      throw new Error("Court not found");
    }

    // Calculate endTime based on duration
    const durationInHours = duration / 60;
    const endTime = startTime + durationInHours;

    // Check for overlapping bookings
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_court_and_date", (q) =>
        q.eq("courtId", courtId).eq("bookingDate", bookingDate)
      )
      .filter((q) => q.eq(q.field("startTime"), startTime))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .first();

    if (existingBooking) {
      throw new Error("This time slot is already booked.");
    }

    // TODO: Calculate price based on pricing rules (Phase 1)
    // For now, use a default price
    const pricePerHour = 500; // Default price
    const price = (duration / 60) * pricePerHour;

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      userId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      duration,
      status: "confirmed",
      purpose,
      notes,
      price,
      isGuest,
      guestName,
      guestPhone,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

// Get all bookings for the logged-in user
export const listForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const bookingsWithCourtInfo = await Promise.all(
      bookings.map(async (booking) => {
        const court = await ctx.db.get(booking.courtId);
        return {
          ...booking,
          courtName: court?.name ?? "Unknown Court",
        };
      })
    );
    return bookingsWithCourtInfo;
  },
});

// Get all bookings for the admin dashboard
export const listAll = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "admin") {
      return []; // Or throw error
    }

    const bookings = await ctx.db.query("bookings").order("desc").collect();

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const court = await ctx.db.get(booking.courtId);
        const user = await ctx.db.get(booking.userId);
        return {
          ...booking,
          courtName: court?.name ?? "Unknown",
          userName: user?.name ?? "Unknown",
        };
      })
    );
    return bookingsWithDetails;
  },
});

// Cancel a booking
export const cancel = mutation({
  args: {
    userId: v.id("users"),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new Error("Booking not found.");
    }

    // Check if the user owns the booking or is an admin
    const user = await ctx.db.get(args.userId);
    if (booking.userId !== args.userId && user?.role !== "admin") {
      throw new Error("You are not authorized to cancel this booking.");
    }

    await ctx.db.patch(args.bookingId, { status: "cancelled" });
  },
});

// Create recurring bookings
export const createRecurring = mutation({
  args: {
    userId: v.id("users"),
    courtId: v.id("courts"),
    bookingDate: v.string(), // First occurrence date
    startTime: v.number(),
    duration: v.optional(v.number()),
    purpose: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurringPattern: v.union(v.literal("weekly"), v.literal("monthly")),
    recurringEndDate: v.string(), // Last occurrence date
  },
  handler: async (ctx, args) => {
    const {
      userId,
      courtId,
      bookingDate,
      startTime,
      duration = 60,
      purpose,
      notes,
      recurringPattern,
      recurringEndDate,
    } = args;

    // Generate unique series ID
    const recurringSeriesId = `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate endTime
    const durationInHours = duration / 60;
    const endTime = startTime + durationInHours;

    // Get court for pricing
    const court = await ctx.db.get(courtId);
    if (!court) {
      throw new Error("Court not found");
    }

    const pricePerHour = court.hourlyRate || 500;
    const price = (duration / 60) * pricePerHour;

    // Generate all booking dates
    const dates: string[] = [];
    let currentDate = new Date(bookingDate);
    const endDate = new Date(recurringEndDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);

      // Increment date based on pattern
      if (recurringPattern === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (recurringPattern === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Create all bookings
    const createdBookings: Id<"bookings">[] = [];
    for (const date of dates) {
      // Check for conflicts
      const existingBooking = await ctx.db
        .query("bookings")
        .withIndex("by_court_and_date", (q) =>
          q.eq("courtId", courtId).eq("bookingDate", date)
        )
        .filter((q) => q.eq(q.field("startTime"), startTime))
        .filter((q) => q.eq(q.field("status"), "confirmed"))
        .first();

      if (existingBooking) {
        // Skip this date if there's a conflict
        continue;
      }

      const bookingId = await ctx.db.insert("bookings", {
        userId,
        courtId,
        bookingDate: date,
        startTime,
        endTime,
        duration,
        status: "confirmed",
        purpose,
        notes,
        price,
        isRecurring: true,
        recurringSeriesId,
        recurringPattern,
        recurringEndDate,
        createdAt: Date.now(),
      });

      createdBookings.push(bookingId);
    }

    return {
      seriesId: recurringSeriesId,
      bookingsCreated: createdBookings.length,
      totalAttempted: dates.length,
    };
  },
});
