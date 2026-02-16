import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const login = mutation({
    args: {
        adminId: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();

        if (!admin || !bcrypt.compareSync(args.password, admin.password)) {
            throw new Error("Invalid Admin ID or Password");
        }

        return {
            adminId: admin.adminId,
            name: admin.name,
            plant: admin.plant,
        };
    },
});

export const getAdmin = query({
    args: { adminId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();
    },
});
