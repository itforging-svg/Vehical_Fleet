import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("vehicles").collect();
    },
});

export const getByRegNo = query({
    args: { registrationNumber: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("vehicles")
            .withIndex("by_registrationNumber", (q) =>
                q.eq("registrationNumber", args.registrationNumber)
            )
            .unique();
    },
});

export const create = mutation({
    args: {
        registrationNumber: v.string(),
        model: v.string(),
        type: v.string(),
        status: v.string(),
        owner: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("vehicles")
            .withIndex("by_registrationNumber", (q) =>
                q.eq("registrationNumber", args.registrationNumber)
            )
            .unique();
        if (existing) {
            throw new Error("Vehicle already exists");
        }
        return await ctx.db.insert("vehicles", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("vehicles"),
        registrationNumber: v.string(),
        model: v.string(),
        type: v.string(),
        status: v.string(),
        owner: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const remove = mutation({
    args: { id: v.id("vehicles") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
