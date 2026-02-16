import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {
        status: v.optional(v.string()),
        plant: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const query = args.status
            ? ctx.db.query("vehicleRequests").withIndex("by_status", (q) => q.eq("status", args.status as any))
            : ctx.db.query("vehicleRequests");

        const results = await (query as any).order("desc").collect();

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
    },
    handler: async (ctx, args) => {
        // Generate Request ID: REQ-YYYYMMDD-XXXX
        const now = new Date();
        const datePrefix = now.toISOString().split('T')[0].replace(/-/g, '');
        const count = (await ctx.db.query("vehicleRequests").collect()).length + 1;
        const requestId = `REQ-${datePrefix}-${count.toString().padStart(4, '0')}`;

        const id = await ctx.db.insert("vehicleRequests", {
            ...args,
            requestId,
            status: "pending",
            createdAt: Date.now(),
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
    },
    handler: async (ctx, args) => {
        const { id, status, vehicleId, driverId, startOdometer } = args;
        const patch: any = { status };
        if (vehicleId) patch.vehicleId = vehicleId;
        if (driverId) patch.driverId = driverId;

        await ctx.db.patch(id, patch);

        // If approved, we could also create a record in the 'trips' table
        if (status === "approved" && vehicleId && driverId) {
            const req = await ctx.db.get(id);
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
        })
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, args.updates);
    },
});
