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

        const id = await ctx.db.insert("maintenanceRecords", args);
        await ctx.db.insert("auditLogs", {
            action: "CREATE",
            module: "Maintenance",
            recordId: id,
            details: `Created maintenance record for ${args.registrationNumber}: ${args.type} (${args.status})`,
            performedBy: args.addedBy,
            timestamp: Date.now(),
            plant: args.plant,
        });
        return id;
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
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const { id, performedBy, ...data } = args;
        const record = await ctx.db.get(id);
        if (!record) return;

        // Auto-update vehicle status based on maintenance status
        if (data.status) {
            if (data.status === "In Progress") {
                await ctx.db.patch(record.vehicleId, { status: "In Maintenance" });
            } else if (data.status === "Completed" || data.status === "Cancelled") {
                await ctx.db.patch(record.vehicleId, { status: "Active" });
            }
        }

        await ctx.db.patch(id, data);

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Maintenance",
            recordId: id,
            details: `Updated maintenance record for ${record.registrationNumber}`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: record.plant,
        });
    },
});

export const remove = mutation({
    args: {
        id: v.id("maintenanceRecords"),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const record = await ctx.db.get(args.id);
        await ctx.db.patch(args.id, { deletedAt: Date.now() });

        await ctx.db.insert("auditLogs", {
            action: "DELETE",
            module: "Maintenance",
            recordId: args.id,
            details: `Deleted maintenance record for ${record?.registrationNumber || "Unknown"}`,
            performedBy: args.performedBy,
            timestamp: Date.now(),
            plant: record?.plant,
        });
    },
});
