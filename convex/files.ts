import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a short-lived upload URL for the frontend
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// Get the actual downloadable/viewable URL for a given storage ID
export const getUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
