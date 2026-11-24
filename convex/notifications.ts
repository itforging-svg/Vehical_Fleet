import { adminMutation as mutation, adminQuery as query, assertSuperAdmin } from "./functions";
import { v } from "convex/values";

export const list = query({
    args: { status: v.optional(v.string()) },
    handler: async (ctx, args) => {
        assertSuperAdmin(ctx.admin.adminId);
        const { status } = args;
        const notifications = status
            ? await ctx.db.query("notifications").withIndex("by_status", (q) => q.eq("status", status)).order("desc").collect()
            : await ctx.db.query("notifications").order("desc").collect();
        if (!ctx.admin.plant) return notifications;
        const visible = [];
        for (const notification of notifications) {
            const vehicle = await ctx.db.get(notification.vehicleId);
            if (vehicle?.locationPlant === ctx.admin.plant) visible.push(notification);
        }
        return visible;
    },
});

export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        assertSuperAdmin(ctx.admin.adminId);
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("status", "unread"))
            .collect();
        if (!ctx.admin.plant) return unread.length;
        let count = 0;
        for (const notification of unread) {
            const vehicle = await ctx.db.get(notification.vehicleId);
            if (vehicle?.locationPlant === ctx.admin.plant) count++;
        }
        return count;
    },
});

export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        assertSuperAdmin(ctx.admin.adminId);
        const notification = await ctx.db.get(args.id);
        if (!notification) return;
        const vehicle = await ctx.db.get(notification.vehicleId);
        if (ctx.admin.plant && vehicle?.locationPlant !== ctx.admin.plant) throw new Error("Forbidden");
        await ctx.db.patch(args.id, { status: "read" });
    },
});

export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        assertSuperAdmin(ctx.admin.adminId);
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_status", (q) => q.eq("status", "unread"))
            .collect();
        for (const notification of unread) {
            if (ctx.admin.plant) {
                const vehicle = await ctx.db.get(notification.vehicleId);
                if (vehicle?.locationPlant !== ctx.admin.plant) continue;
            }
            await ctx.db.patch(notification._id, { status: "read" });
        }
    },
});

export const syncExpiries = mutation({
    args: {},
    handler: async (ctx) => {
        const vehicles = await ctx.db.query("vehicles").collect();
        const now = new Date();
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        for (const vehicle of vehicles) {
            if (ctx.admin.plant && vehicle.locationPlant !== ctx.admin.plant) continue;
            const checks = [
                { date: vehicle.rcExpiryDate, type: "RC", label: "RC" },
                { date: vehicle.insuranceExpiryDate, type: "INSURANCE", label: "Insurance" },
                { date: vehicle.pucExpiryDate, type: "PUC", label: "PUC" },
                { date: vehicle.fitnessExpiryDate, type: "FITNESS", label: "Fitness Certificate" },
                { date: vehicle.permitExpiryDate, type: "PERMIT", label: "Permit" },
            ];

            for (const check of checks) {
                if (!check.date) continue;

                const expiryDate = new Date(check.date);
                const expiryAtMidnight = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate()).getTime();
                const diffTime = expiryAtMidnight - todayAtMidnight;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Thresholds: 15, 7, 3, and 0 (expired)
                const thresholds = [15, 7, 3, 0];

                for (const threshold of thresholds) {
                    const isAppropriateThreshold = threshold === 0 ? diffDays <= 0 : (diffDays > 0 && diffDays <= threshold);

                    if (isAppropriateThreshold) {
                        // Check if a notification already exists for this vehicle, type, date, AND threshold
                        const existing = await ctx.db
                            .query("notifications")
                            .withIndex("by_vehicle_type", (q) =>
                                q.eq("vehicleId", vehicle._id).eq("type", check.type)
                            )
                            .collect();

                        const alreadyNotified = existing.some(n =>
                            n.expiryDate === check.date &&
                            n.leadDays === threshold
                        );

                        if (!alreadyNotified) {
                            let title = "";
                            let message = "";

                            if (threshold === 0) {
                                title = `${check.label} Expired`;
                                message = `The ${check.label} for vehicle ${vehicle.registrationNumber} (${vehicle.model}) has expired on ${check.date}.`;
                            } else {
                                title = `${check.label} Expiry Alert (${threshold} Days)`;
                                message = `The ${check.label} for vehicle ${vehicle.registrationNumber} (${vehicle.model}) will expire in ${diffDays} days (${check.date}).`;
                            }

                            await ctx.db.insert("notifications", {
                                type: check.type,
                                vehicleId: vehicle._id,
                                registrationNumber: vehicle.registrationNumber,
                                title,
                                message,
                                status: "unread",
                                expiryDate: check.date,
                                leadDays: threshold,
                                createdAt: Date.now(),
                            });
                        }
                    }
                }
            }
        }
    },
});
