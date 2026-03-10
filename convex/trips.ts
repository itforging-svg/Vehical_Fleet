import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateCslId } from "./idHelper";

export const list = query({
    args: { plant: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const trips = await ctx.db.query("trips").collect();
        if (args.plant) {
            return trips.filter(t => t.startLocation === args.plant || t.endLocation === args.plant);
        }
        return trips;
    },
});

export const createRequest = mutation({
    args: {
        requesterName: v.string(),
        requesterDepartment: v.string(),
        purpose: v.string(),
        startLocation: v.string(),
        endLocation: v.string(),
        startTime: v.number(),
        status: v.string(),
        notes: v.optional(v.string()),
        startOdometer: v.optional(v.number()),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        // Generate unique CSL ID for internal movement
        const { performedBy, ...tripData } = args;
        const requestId = await generateCslId(ctx, "trips");
        const id = await ctx.db.insert("trips", { ...tripData, requestId });

        await ctx.db.insert("auditLogs", {
            action: "CREATE",
            module: "Operational Logs",
            recordId: id,
            details: `Created trip request for ${args.requesterName}`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: args.startLocation,
        });
        return id;
    },
});

export const assignVehicle = mutation({
    args: {
        id: v.id("trips"),
        vehicleId: v.id("vehicles"),
        driverId: v.id("drivers"),
        status: v.string(),
        startOdometer: v.optional(v.number()),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const { id, performedBy, ...data } = args;
        const trip = await ctx.db.get(id);
        await ctx.db.patch(id, data);

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Operational Logs",
            recordId: id,
            details: `Assigned vehicle/driver to trip: ${trip?.requestId}`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: trip?.startLocation,
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("trips"),
        status: v.string(),
        endTime: v.optional(v.number()),
        endOdometer: v.optional(v.number()),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const { id, status, endTime, endOdometer, performedBy } = args;
        const trip = await ctx.db.get(id);
        await ctx.db.patch(id, { status, endTime, endOdometer });

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Operational Logs",
            recordId: id,
            details: `Trip ${trip?.requestId} status changed to ${status}`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: trip?.startLocation,
        });

        if (status === "Completed") {
            const trip = await ctx.db.get(id);
            if (trip) {
                // Release Assets
                if (trip.vehicleId) {
                    await ctx.db.patch(trip.vehicleId, { status: "Active" });
                }
                if (trip.driverId) {
                    await ctx.db.patch(trip.driverId, { status: "Available" });
                }

                // Sync with vehicleRequests if requestId exists
                if (trip.requestId) {
                    const req = await ctx.db
                        .query("vehicleRequests")
                        .withIndex("by_requestId", (q) => q.eq("requestId", trip.requestId as string))
                        .unique();

                    if (req) {
                        await ctx.db.patch(req._id, { status: "completed" });
                    }
                }
            }
        }
    },
});

export const updateDetails = mutation({
    args: {
        id: v.id("trips"),
        updates: v.object({
            requesterName: v.optional(v.string()),
            requesterDepartment: v.optional(v.string()),
            purpose: v.optional(v.string()),
            startLocation: v.optional(v.string()),
            endLocation: v.optional(v.string()),
            notes: v.optional(v.string()),
            startOdometer: v.optional(v.number()),
            endOdometer: v.optional(v.number()),
        }),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const trip = await ctx.db.get(args.id);
        await ctx.db.patch(args.id, args.updates);

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Operational Logs",
            recordId: args.id,
            details: `Edited details for trip: ${trip?.requestId}`,
            performedBy: args.performedBy,
            timestamp: Date.now(),
            plant: trip?.startLocation,
        });
    },
});
