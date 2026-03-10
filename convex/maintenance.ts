import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List maintenance records with soft delete filtering
export const list = query({
    args: {
        plant: v.optional(v.string()),
        vehicleId: v.optional(v.id("vehicles")),
    },
    handler: async (ctx, args) => {
        let records = (await ctx.db.query("maintenanceRecords").collect()).filter(r => r.deletedAt === undefined);

        if (args.plant) {
            records = records.filter(r => r.plant === args.plant);
        }

        if (args.vehicleId) {
            records = records.filter(r => r.vehicleId === args.vehicleId);
        }

        // Sort by newest first
        return records.sort((a, b) => b.serviceDate - a.serviceDate);
    },
});

export const getStats = query({
    args: {
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let records = (await ctx.db.query("maintenanceRecords").collect()).filter(r => r.deletedAt === undefined);

        if (args.plant) {
            records = records.filter(r => r.plant === args.plant);
        }

        const now = Date.now();
        const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();

        const currentMonthRecords = records.filter(r => r.serviceDate >= startOfMonth);

        const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
        const currentMonthCost = currentMonthRecords.reduce((sum, r) => sum + r.cost, 0);

        const inProgressCount = records.filter(r => r.status === "In Progress").length;
        const scheduledUpcoming = records.filter(r => r.status === "Scheduled" && r.serviceDate >= now).length;

        return {
            totalMaintenanceEvents: records.length,
            totalCost,
            currentMonthCost,
            inProgressCount,
            scheduledUpcoming,
        };
    },
});

export const create = mutation({
    args: {
        vehicleId: v.id("vehicles"),
        registrationNumber: v.string(),
        plant: v.string(),
        type: v.string(),
        status: v.string(),
        serviceDate: v.number(),
        completionDate: v.optional(v.number()),
        odometer: v.number(),
        description: v.string(),
        vendorName: v.optional(v.string()),
        billNumber: v.optional(v.string()),
        cost: v.number(),
        addedBy: v.string(),
        invoiceId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        // Auto-update vehicle status
        if (args.status === "In Progress") {
            await ctx.db.patch(args.vehicleId, { status: "In Maintenance" });
        } else if (args.status === "Completed") {
            await ctx.db.patch(args.vehicleId, { status: "Active" });
        }

        return await ctx.db.insert("maintenanceRecords", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("maintenanceRecords"),
        vehicleId: v.optional(v.id("vehicles")),
        registrationNumber: v.optional(v.string()),
        plant: v.optional(v.string()),
        type: v.string(),
        status: v.string(),
        serviceDate: v.number(),
        completionDate: v.optional(v.number()),
        odometer: v.number(),
        description: v.string(),
        vendorName: v.optional(v.string()),
        billNumber: v.optional(v.string()),
        cost: v.number(),
        invoiceId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;

        // Auto-update vehicle status based on maintenance status
        if (args.status) {
            const existingRecord = await ctx.db.get(id);
            if (existingRecord) {
                if (args.status === "In Progress") {
                    await ctx.db.patch(existingRecord.vehicleId, { status: "In Maintenance" });
                } else if (args.status === "Completed" || args.status === "Cancelled") {
                    await ctx.db.patch(existingRecord.vehicleId, { status: "Active" });
                }
            }
        }

        await ctx.db.patch(id, data);
    },
});

// Soft delete
export const remove = mutation({
    args: { id: v.id("maintenanceRecords") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});
