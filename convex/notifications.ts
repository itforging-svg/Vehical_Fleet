import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: { status: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const { status } = args;
        if (status) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_status", (q) => q.eq("status", status))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("notifications").order("desc").collect();
    },
});

export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("status", "unread"))
            .collect();
        return unread.length;
    },
});

export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: "read" });
    },
});

export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("status", "unread"))
            .collect();
        for (const notification of unread) {
            await ctx.db.patch(notification._id, { status: "read" });
        }
    },
});

export const syncExpiries = mutation({
    args: {},
    handler: async (ctx) => {
        const vehicles = await ctx.db.query("vehicles").collect();
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        for (const vehicle of vehicles) {
            const checks = [
                { date: vehicle.rcExpiryDate, type: "RC", label: "RC" },
                { date: vehicle.insuranceExpiryDate, type: "INSURANCE", label: "Insurance" },
                { date: vehicle.pucExpiryDate, type: "PUC", label: "PUC" },
                { date: vehicle.fitnessExpiryDate, type: "FITNESS", label: "Fitness Certificate" },
                { date: vehicle.permitExpiryDate, type: "PERMIT", label: "Permit" },
            ];

            for (const check of checks) {
                if (!check.date) continue;

                // Document is expired if expiry date is today or in the past
                if (check.date <= todayStr) {
                    // Check if notification already exists for this vehicle and type that is unread
                    const existing = await ctx.db
                        .query("notifications")
                        .withIndex("by_vehicle_type", (q) =>
                            q.eq("vehicleId", vehicle._id).eq("type", check.type)
                        )
                        .collect();

                    const unreadExists = existing.some(n => n.status === "unread");

                    if (!unreadExists) {
                        await ctx.db.insert("notifications", {
                            type: check.type,
                            vehicleId: vehicle._id,
                            registrationNumber: vehicle.registrationNumber,
                            title: `${check.label} Expired`,
                            message: `The ${check.label} for vehicle ${vehicle.registrationNumber} (${vehicle.model}) has expired on ${check.date}.`,
                            status: "unread",
                            createdAt: Date.now(),
                        });
                    }
                }
            }
        }
    },
});
