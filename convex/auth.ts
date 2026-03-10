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

// Safely add (or update) a single admin without touching other accounts
export const addAdmin = mutation({
    args: {
        adminId: v.string(),
        password: v.string(),
        name: v.string(),
        plant: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if admin already exists
        const existing = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .unique();

        const hashedPassword = bcrypt.hashSync(args.password, 10);

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                password: hashedPassword,
                name: args.name,
                plant: args.plant,
            });
            return `Updated admin: ${args.adminId}`;
        } else {
            // Insert new
            await ctx.db.insert("admins", {
                adminId: args.adminId,
                password: hashedPassword,
                name: args.name,
                plant: args.plant,
            });
            return `Created admin: ${args.adminId}`;
        }
    },
});
