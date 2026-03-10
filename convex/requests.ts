import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateCslId } from "./idHelper";

export const list = query({
    args: {
        status: v.optional(v.string()),
        plant: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const requestQuery = args.status
            ? ctx.db.query("vehicleRequests").withIndex("by_status", (q) => q.eq("status", args.status as any))
            : ctx.db.query("vehicleRequests");

        const results = await (requestQuery as any).order("desc").collect();

        if (args.plant) {
            return results.filter((r: any) => r.plant === args.plant);
        }

        return results;
    },
});

export const createRequest = mutation({
    args: {
        requesterName: v.string(),
        employeeId: v.string(),
        department: v.string(),
        plant: v.string(),
        contactNumber: v.string(),
        purpose: v.string(),
        priority: v.string(),
        pickupLocation: v.string(),
        dropLocation: v.string(),
        tripType: v.string(),
        vehicleType: v.string(),
        bookingDateTime: v.optional(v.string()),
        performedBy: v.optional(v.string()), // Added for auditing
    },
    handler: async (ctx, args) => {
        // Generate Request ID: CSL-DD.MM.YY-NN (daily sequence)
        const { performedBy, ...requestData } = args;
        const requestId = await generateCslId(ctx, "vehicleRequests");

        const id = await ctx.db.insert("vehicleRequests", {
            ...requestData,
            requestId,
            status: "pending",
            createdAt: Date.now(),
        });

        await ctx.db.insert("auditLogs", {
            action: "CREATE",
            module: "Vehicle Requests",
            recordId: id,
            details: `Created vehicle request: ${requestId} for ${args.requesterName}`,
            performedBy: performedBy ?? args.requesterName,
            timestamp: Date.now(),
            plant: args.plant,
        });

        return { id, requestId };
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("vehicleRequests"),
        status: v.string(),
        vehicleId: v.optional(v.id("vehicles")),
        driverId: v.optional(v.id("drivers")),
        startOdometer: v.optional(v.number()),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const { id, status, vehicleId, driverId, startOdometer, performedBy } = args;
        const req = await ctx.db.get(id);
        const patch: any = { status };
        if (vehicleId) patch.vehicleId = vehicleId;
        if (driverId) patch.driverId = driverId;

        await ctx.db.patch(id, patch);

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Vehicle Requests",
            recordId: id,
            details: `Request ${req?.requestId} status changed to ${status}`,
            performedBy: performedBy,
            timestamp: Date.now(),
            plant: req?.plant,
        });

        // If approved, we could also create a record in the 'trips' table
        if (status === "approved" && vehicleId && driverId) {
            if (req) {
                await ctx.db.insert("trips", {
                    vehicleId,
                    driverId,
                    requestId: req.requestId,
                    requesterName: req.requesterName,
                    requesterDepartment: req.department,
                    purpose: req.purpose,
                    startLocation: req.pickupLocation,
                    endLocation: req.dropLocation,
                    startTime: Date.now(),
                    startOdometer: startOdometer,
                    status: "In Progress",
                });

                // Update Vehicle and Driver status to "On Duty"
                await ctx.db.patch(vehicleId, { status: "On Duty" });
                await ctx.db.patch(driverId, { status: "On Duty" });
            }
        }
    },
});

export const updateDetails = mutation({
    args: {
        id: v.id("vehicleRequests"),
        updates: v.object({
            requesterName: v.optional(v.string()),
            employeeId: v.optional(v.string()),
            department: v.optional(v.string()),
            plant: v.optional(v.string()),
            contactNumber: v.optional(v.string()),
            purpose: v.optional(v.string()),
            priority: v.optional(v.string()),
            pickupLocation: v.optional(v.string()),
            dropLocation: v.optional(v.string()),
            tripType: v.optional(v.string()),
            vehicleType: v.optional(v.string()),
            bookingDateTime: v.optional(v.string()),
        }),
        performedBy: v.string(), // Added for auditing
    },
    handler: async (ctx, args) => {
        const req = await ctx.db.get(args.id);
        await ctx.db.patch(args.id, args.updates);

        await ctx.db.insert("auditLogs", {
            action: "UPDATE",
            module: "Vehicle Requests",
            recordId: args.id,
            details: `Updated details for request ${req?.requestId}`,
            performedBy: args.performedBy,
            timestamp: Date.now(),
            plant: req?.plant,
        });
    },
});
