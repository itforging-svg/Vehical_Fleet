import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("drivers").collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        licenseNumber: v.string(),
        phoneNumber: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("drivers")
            .withIndex("by_licenseNumber", (q) =>
                q.eq("licenseNumber", args.licenseNumber)
            )
            .unique();
        if (existing) {
            throw new Error("Driver already exists");
        }
        return await ctx.db.insert("drivers", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("drivers"),
        name: v.string(),
        licenseNumber: v.string(),
        phoneNumber: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: { id: v.id("drivers") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
