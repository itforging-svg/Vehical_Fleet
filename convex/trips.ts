import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("trips").collect();
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
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("trips", args);
    },
});

export const assignVehicle = mutation({
    args: {
        id: v.id("trips"),
        vehicleId: v.id("vehicles"),
        driverId: v.id("drivers"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("trips"),
        status: v.string(),
        endTime: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});
